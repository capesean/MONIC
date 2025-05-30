using Azure;
using Azure.AI.OpenAI;
using Azure.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

            Response.Headers.Append("Content-Disposition", questionnaireExport.GetContentDisposition().ToString());

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

            return Ok(results);
        }

        [HttpGet("{questionnaireId:Guid}/download"), AuthorizeRoles(Roles.Questionnaires)]
        public async Task<IActionResult> Download([FromRoute] Guid questionnaireId, [FromQuery] bool includeSkipLogic = false, [FromQuery] bool includeSummaries = false, [FromQuery] Guid? responseId = null, [FromQuery] Guid? dateId = null)
        {
            var questionnaire = await db.Questionnaires
                .FirstOrDefaultAsync(o => o.QuestionnaireId == questionnaireId);

            if (questionnaire == null)
                return NotFound();

            WEB.Models.Response response = null;
            if (responseId.HasValue)
            {
                response = await CurrentUser.GetPermittedResponsesQuery()
                .FirstOrDefaultAsync(o => o.ResponseId == responseId);

                if (response == null)
                    return NotFound();
            }

            var pdf = new QuestionnairePDF(db, AppSettings, questionnaire, response, dateId, includeSkipLogic, includeSummaries);

            byte[] bytes = await pdf.GenerateAsync();

            Response.Headers.Append("Content-Disposition", pdf.GetContentDisposition().ToString());

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

            var dbSettings = AppSettings.GetDbSettings(db);

            if (string.IsNullOrWhiteSpace(dbSettings.ChatGPTAPIKey)) return BadRequest("The ChatGPT API Key is missing");

            AzureOpenAIClientOptions azureOptions = new()
            {
                Audience = AzureOpenAIAudience.AzureGovernment,
            };

            var aoaiclient = new AzureOpenAIClient(
                new Uri("https://sean-map4tkmq-eastus2.cognitiveservices.azure.com/"),
                new AzureKeyCredential("2Zy3SvZng910SIWQ3IrODe8Tg1X3IU5eqKQBApNlSLaUf8Eh8ZEvJQQJ99BEACHYHv6XJ3w3AAAAACOGpQ7j"),
                azureOptions
                );

            var chatClient = aoaiclient.GetChatClient("o4-mini-2");

            var requestOptions = new OpenAI.Chat.ChatCompletionOptions()
            {
                MaxOutputTokenCount = 10000,
            };


            var answers = await db.Answers
                .Include(o => o.AnswerOptions)
                .Include(o => o.Response.Entity)
                .Where(o => o.QuestionId == generateSummariesModel.QuestionId && o.Response.QuestionnaireId == questionnaire.QuestionnaireId)
                .ToListAsync();

            if (!answers.Any()) return BadRequest($"There are no answers for question {question.Code}");

            //var chatCompletionCreateRequest = new Azure.AI.OpenAI.ChatCompletionCreateRequest()
            //{
            //    Messages = null,
            //    Model = OpenAI.ObjectModels.Models.Gpt_4o,
            //    MaxTokens = generateSummariesModel.MaxTokens,
            //    N = 1,
            //    Temperature = generateSummariesModel.Temperature
            //};

            var messages = new List<OpenAI.Chat.ChatMessage>();
            foreach (var message in generateSummariesModel.SystemMessage.Replace(Environment.NewLine, "\n").Split("\n"))
                if (!string.IsNullOrWhiteSpace(message)) messages.Add(OpenAI.Chat.ChatMessage.CreateSystemMessage(message));


            if (question.QuestionType == QuestionType.Multiline || question.QuestionType == QuestionType.Text)
            {
                var answerList = string.Empty;
                foreach (var answer in answers)
                    answerList += $"{questionnaire.EntityType.Name} {answer.Response.Entity.Code}: {answer.Value}\n";

                generateSummariesModel.TextPrompt = generateSummariesModel.TextPrompt
                    .Replace(Environment.NewLine, "\n")
                    .Replace("{questionText}", question.Text)
                    .Replace("{answerCount}", answers.Count.ToString())
                    .Replace("{entityTypePlural}", questionnaire.EntityType.Plural)
                    .Replace("[{answers}]", answerList);
                // todo: multiline text answers could be on multiple lines, meaning the answer splits across chatmessages.
                foreach (var message in generateSummariesModel.TextPrompt.Split("\n"))
                    if (!string.IsNullOrWhiteSpace(message)) messages.Add(OpenAI.Chat.ChatMessage.CreateUserMessage(message));
            }
            else if (question.QuestionType == QuestionType.OptionList)
            {
                var answerList = string.Empty;

                var questionOptions = await db.QuestionOptions
                    .Where(o => o.QuestionOptionGroupId == question.QuestionOptionGroupId)
                    .ToDictionaryAsync(o => o.QuestionOptionId);

                var counter = 1;
                foreach (var questionOption in questionOptions.Values.OrderBy(o => o.SortOrder))
                {
                    var optionCount = answers.Count(o => o.AnswerOptions.Any(ao => ao.QuestionOptionId == questionOption.QuestionOptionId));
                    answerList += $"Option {counter++}: {questionOption.Label} - {optionCount} {questionnaire.EntityType.Plural.ToLowerInvariant()} selected this option.\n";
                }

                generateSummariesModel.OptionListPrompt = generateSummariesModel.OptionListPrompt
                    .Replace(Environment.NewLine, "\n")
                    .Replace("{questionText}", question.Text)
                    .Replace("{answerCount}", answers.Count.ToString())
                    .Replace("{entityTypePlural}", questionnaire.EntityType.Plural)
                    .Replace("[{optionsAndCounts}]", answerList);

                foreach (var message in generateSummariesModel.OptionListPrompt.Split("\n"))
                    if (!string.IsNullOrWhiteSpace(message)) messages.Add(OpenAI.Chat.ChatMessage.CreateUserMessage(message));
            }
            else
                throw new Exception("Invalid question type");

            //chatCompletionCreateRequest.Messages = messages;
            var options = new OpenAI.Chat.ChatCompletionOptions();

            var completionResult = await chatClient.CompleteChatAsync(messages, options);

            //var completionResult = await gpt.ChatCompletion.CreateCompletion(chatCompletionCreateRequest);

            //if (!completionResult.suc)
            //{
            //    if (completionResult.Error == null)
            //    {
            //        throw new Exception("Unknown Error");
            //    }
            //    return BadRequest($"{completionResult.Error.Code}: {completionResult.Error.Message}");
            //}

            questionSummary.Summary = completionResult.Value.Content.First().Text;

            await db.SaveChangesAsync();

            return Ok(ModelFactory.Create(questionSummary));
        }

        [HttpPost("{questionnaireId:Guid}/duplicate"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Duplicate([FromRoute] Guid questionnaireId, [FromBody] DuplicateModel model)
        {
            var questionnaire = await db.Questionnaires
                .FirstOrDefaultAsync(o => o.QuestionnaireId == questionnaireId);

            if (questionnaire == null)
                return NotFound();

            var newQuestionnaire = new Questionnaire();
            ModelFactory.Hydrate(newQuestionnaire, ModelFactory.Create(questionnaire));
            newQuestionnaire.Name = model.Name;
            newQuestionnaire.PublicCode = null;
            db.Entry(newQuestionnaire).State = EntityState.Added;

            var sections = await db.Sections
                .Where(o => o.QuestionnaireId == questionnaireId)
                .ToListAsync();

            var questions = await db.Questions
                .Where(o => o.Section.QuestionnaireId == questionnaireId)
                .ToListAsync();

            var questionOptionGroups = await db.QuestionOptionGroups
                .ToDictionaryAsync(o => o.QuestionOptionGroupId);

            var questionIdMap = new Dictionary<Guid, Guid>();
            foreach (var question in questions)
                questionIdMap.Add(question.QuestionId, Guid.NewGuid());

            var questionOptionIdMap = new Dictionary<Guid, Guid>();

            foreach (var section in sections)
            {
                var newSection = new Section();
                ModelFactory.Hydrate(newSection, ModelFactory.Create(section));
                newSection.QuestionnaireId = newQuestionnaire.QuestionnaireId;
                db.Entry(newSection).State = EntityState.Added;

                foreach (var question in questions.Where(o => o.SectionId == section.SectionId))
                {
                    var newQuestion = new Question();
                    ModelFactory.Hydrate(newQuestion, ModelFactory.Create(question));
                    newQuestion.QuestionId = questionIdMap[question.QuestionId];
                    newQuestion.SectionId = newSection.SectionId;
                    if (question.CheckQuestionId.HasValue) newQuestion.CheckQuestionId = questionIdMap[question.CheckQuestionId.Value];
                    db.Entry(newQuestion).State = EntityState.Added;

                    if (question.QuestionOptionGroupId.HasValue)
                    {
                        if (!questionOptionGroups[question.QuestionOptionGroupId.Value].Shared)
                        {
                            var newQuestionOptionGroup = new QuestionOptionGroup();
                            newQuestionOptionGroup.QuestionOptionGroupId = newQuestion.QuestionId;
                            newQuestionOptionGroup.Name = newQuestion.QuestionId.ToString().ToLowerInvariant();
                            newQuestionOptionGroup.Shared = false;
                            db.Entry(newQuestionOptionGroup).State = EntityState.Added;

                            newQuestion.QuestionOptionGroupId = newQuestionOptionGroup.QuestionOptionGroupId;
                            
                            var questionOptions = await db.QuestionOptions.Where(o => o.QuestionOptionGroupId == question.QuestionOptionGroupId.Value).ToListAsync();
                            foreach (var questionOption in questionOptions)
                            {
                                var newQuestionOption = new QuestionOption();
                                ModelFactory.Hydrate(newQuestionOption, ModelFactory.Create(questionOption));
                                newQuestionOption.QuestionOptionId = Guid.NewGuid();
                                newQuestionOption.QuestionOptionGroupId = newQuestionOptionGroup.QuestionOptionGroupId;
                                db.Entry(newQuestionOption).State = EntityState.Added;

                                questionOptionIdMap.Add(questionOption.QuestionOptionId, newQuestionOption.QuestionOptionId);
                            }
                        }
                        else
                        {
                            var questionOptions = await db.QuestionOptions.Where(o => o.QuestionOptionGroupId == question.QuestionOptionGroupId.Value).ToListAsync();
                            foreach (var questionOption in questionOptions)
                            {
                                if (!questionOptionIdMap.ContainsKey(questionOption.QuestionOptionId))
                                    questionOptionIdMap.Add(questionOption.QuestionOptionId, questionOption.QuestionOptionId);
                            }
                        }
                    }
                }
            }

            var skipLogicOptions = await db.SkipLogicOptions
                .Where(o => o.Question.Section.QuestionnaireId == questionnaireId)
                .ToListAsync();

            foreach (var skipLogicOption in skipLogicOptions)
            {
                var newSkipLogicOption = new SkipLogicOption();
                newSkipLogicOption.QuestionId = questionIdMap[skipLogicOption.QuestionId];
                // newSkipLogicOption.CheckQuestionOptionId = skipLogicOption.CheckQuestionOptionId;
                newSkipLogicOption.CheckQuestionOptionId = questionOptionIdMap[skipLogicOption.CheckQuestionOptionId];
                db.Entry(newSkipLogicOption).State = EntityState.Added;
            }

            await db.SaveChangesAsync();

            return Ok(ModelFactory.Create(newQuestionnaire));
        }

        public class GenerateSummariesModel
        {
            public Guid QuestionnaireId { get; set; }
            public Guid QuestionId { get; set; }
            public Guid DateId { get; set; }
            public string SystemMessage { get; set; }
            public string TextPrompt { get; set; }
            public string OptionListPrompt { get; set; }
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

        public class DuplicateModel
        {
            public string Name { get; set; }
        }
    }

}
