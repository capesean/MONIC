using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenAI.GPT3.ObjectModels.RequestModels;
using OpenAI.GPT3;
using OpenAI.GPT3.Managers;
using WEB.Models;
using WEB.Reports.Excel;
using WEB.Reports.PDF;

namespace WEB.Controllers
{
    public partial class QuestionnairesController : BaseApiController
    {
        [HttpPost("export"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Export([FromBody] ExportModel exportModel)
        {
            var questionnaire = await db.Questionnaires
                .Include(o => o.EntityType)
                .FirstOrDefaultAsync(o => o.QuestionnaireId == exportModel.QuestionnaireId);

            if (questionnaire == null)
                return NotFound();

            var questionnaireExport = new QuestionnaireExport(db, AppSettings, questionnaire, exportModel.EntityIds, exportModel.DateIds, exportModel.FieldIds, exportModel.IncludeSummaries, exportModel.UseOptionValues, exportModel.UseOptionColors, exportModel.IncludeCharts);

            byte[] bytes = await questionnaireExport.GenerateAsync();

            Response.Headers.Add("Content-Disposition", questionnaireExport.GetContentDisposition().ToString());

            return File(bytes, questionnaireExport.GetContentType());
        }

        [HttpPost("{questionnaireId:Guid}/progress/{dateId:Guid}"), AuthorizeRoles(Roles.Questionnaires)]
        public async Task<IActionResult> Progress(Guid questionnaireId, Guid dateId, [FromBody] Guid[] entityIds)
        {
            var responses = await CurrentUser.GetPermittedResponsesQuery()
                .Include(o => o.Entity)
                .Where(o => o.QuestionnaireId == questionnaireId && o.DateId == dateId)
                .Where(o => !entityIds.Any() || entityIds.Contains(o.EntityId))
                .ToListAsync();

            var results = responses.Select(o => new SurveyProgress()
            {
                TotalQuestions = o.TotalQuestions,
                ApplicableQuestions = o.ApplicableQuestions,
                CompletedQuestions = o.CompletedQuestions,
                Entity = ModelFactory.Create(o.Entity)
            }).ToList();

            //var results = responses.Select(o => new SurveyProgress()
            //{
            //    TotalQuestions = 30,//o.TotalQuestions,
            //    ApplicableQuestions = 30,//o.ApplicableQuestions,
            //    CompletedQuestions = new Random().Next(0, 30),//o.ApplicableQuestions),
            //    Entity = ModelFactory.Create(o.Entity)
            //}).ToList();

            return Ok(results);
        }

        [HttpGet("{questionnaireId:Guid}/download"), AuthorizeRoles(Roles.Questionnaires)]
        public async Task<IActionResult> Download([FromRoute] Guid questionnaireId, [FromQuery] bool includeSkipLogic = false, [FromQuery] bool includeSummaries = false, [FromQuery] Guid? responseId = null, [FromQuery] Guid? dateId = null)
        {
            var questionnaire = await db.Questionnaires
                .FirstOrDefaultAsync(o => o.QuestionnaireId == questionnaireId);

            if (questionnaire == null)
                return NotFound();

            Response response = null;
            if (responseId.HasValue)
            {
                response = await CurrentUser.GetPermittedResponsesQuery()
                .FirstOrDefaultAsync(o => o.ResponseId == responseId);

                if (response == null)
                    return NotFound();
            }

            var pdf = new QuestionnairePDF(db, AppSettings, questionnaire, response, dateId, includeSkipLogic, includeSummaries);

            byte[] bytes = await pdf.GenerateAsync();

            Response.Headers.Add("Content-Disposition", pdf.GetContentDisposition().ToString());

            return File(bytes, pdf.GetContentType());
        }

        [HttpPost("generatesummaries"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> GenerateSummaries([FromBody] GenerateSummariesModel generateSummariesModel)
        {
            var questionnaire = await db.Questionnaires
                .Include(o => o.EntityType)
                .FirstOrDefaultAsync(o => o.QuestionnaireId == generateSummariesModel.QuestionnaireId);

            if (questionnaire == null)
                return NotFound();

            var questionSummary = await db.QuestionSummaries
                .FirstOrDefaultAsync(o => o.QuestionId == generateSummariesModel.QuestionId && o.DateId == generateSummariesModel.DateId);

            if (questionSummary == null)
            {
                questionSummary = new QuestionSummary() { QuestionId = generateSummariesModel.QuestionId, DateId = generateSummariesModel.DateId };
                db.Entry(questionSummary).State = EntityState.Added;
            }
            else
            {
                db.Entry(questionSummary).State = EntityState.Modified;
            }

            var systemMessage = $"You are a helpful assistant that analyzes and summarizes responses to questions from a questionnaire that was distributed to {questionnaire.EntityType.Plural}. Respond without any thanks.";

            var responseCount = await db.Responses.CountAsync(o => o.QuestionnaireId == questionnaire.QuestionnaireId);

            var question = await db.Questions
                .Where(o => o.QuestionId == generateSummariesModel.QuestionId && o.Section.QuestionnaireId == generateSummariesModel.QuestionnaireId)
                .SingleAsync();

            if (question.QuestionType == QuestionType.Document || question.QuestionType == QuestionType.Note)
            {
                questionSummary.Summary = "A generated summary is not available for this question type";
                await db.SaveChangesAsync();

                return Ok(ModelFactory.Create(questionSummary));
            }

            if (responseCount == 0) return BadRequest("There are no responses for this questionnaire");

            var apiKey = AppSettings.GetDbSettings(db).ChatGPTAPIKey;
            if (string.IsNullOrWhiteSpace(apiKey)) return BadRequest("ChatGPT API Key is not set (in Settings)");

            var gpt = new OpenAIService(new OpenAiOptions()
            {
                // todo: move to config
                ApiKey = apiKey
            });

            var answers = await db.Answers
                .Include(o => o.AnswerOptions)
                .Include(o => o.Response.Entity)
                .Where(o => o.QuestionId == generateSummariesModel.QuestionId && o.Response.QuestionnaireId == questionnaire.QuestionnaireId)
                .ToListAsync();

            if (!answers.Any()) return BadRequest($"There are no answers for question {question.Code}");

            var chatCompletionCreateRequest = new ChatCompletionCreateRequest()
            {
                Messages = null,
                Model = OpenAI.GPT3.ObjectModels.Models.ChatGpt3_5Turbo,
                MaxTokens = generateSummariesModel.MaxTokens,
                N = 1,
                Temperature = generateSummariesModel.Temperature
            };

            var messages = new List<ChatMessage> { ChatMessage.FromSystem(systemMessage) };

            if (question.QuestionType == QuestionType.Multiline || question.QuestionType == QuestionType.Text)
            {
                messages.Add(ChatMessage.FromUser($"Please analyse/summarize the answers to the question: {question.Text}"));

                foreach (var answer in answers)
                    messages.Add(ChatMessage.FromUser($"{questionnaire.EntityType.Name} {answer.Response.Entity.Code}: {answer.Value}"));
            }
            else if (question.QuestionType == QuestionType.OptionList)
            {
                var options = await db.QuestionOptions
                    .Where(o => o.QuestionOptionGroupId == question.QuestionOptionGroupId)
                    .ToDictionaryAsync(o => o.QuestionOptionId);

                messages.Add(ChatMessage.FromUser($"Please analyse and summarize the answers to the following {(question.OptionListType == OptionListType.Checkboxes ? "multiple" : "single")}-choice question: {question.Text}"));
                messages.Add(ChatMessage.FromUser($"{answers.Count} {questionnaire.EntityType.Plural} provided responses. The available options were:"));

                var counter = 1;
                foreach (var option in options.Values.OrderBy(o => o.SortOrder))
                {
                    var optionCount = answers.Count(o => o.AnswerOptions.Any(ao => ao.QuestionOptionId == option.QuestionOptionId));
                    messages.Add(ChatMessage.FromUser($"Option {counter++}: {option.Label} - {optionCount} {questionnaire.EntityType.Plural} selected this option."));
                }
            }
            else
                throw new Exception("Invalid question type");

            chatCompletionCreateRequest.Messages = messages;

            var completionResult = await gpt.ChatCompletion.CreateCompletion(chatCompletionCreateRequest);

            if (!completionResult.Successful)
            {
                if (completionResult.Error == null)
                {
                    throw new Exception("Unknown Error");
                }
                return BadRequest($"{completionResult.Error.Code}: {completionResult.Error.Message}");
            }

            questionSummary.Summary = completionResult.Choices.First().Message.Content;

            await db.SaveChangesAsync();

            return Ok(ModelFactory.Create(questionSummary));
        }

        public class GenerateSummariesModel
        {
            public Guid QuestionnaireId { get; set; }
            public Guid QuestionId { get; set; }
            public Guid DateId { get; set; }
            public int MaxTokens { get; set; }
            public float Temperature { get; set; }
        }

        public class ExportModel
        {
            public Guid QuestionnaireId { get; set; }
            public Guid[] EntityIds { get; set; }
            public Guid[] DateIds { get; set; }
            public Guid[] FieldIds { get; set; }
            public bool IncludeSummaries { get; set; }
            public bool UseOptionValues { get; set; }
            public bool UseOptionColors { get; set; }
            public bool IncludeCharts { get; set; }
        }
    }

}
