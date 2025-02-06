using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WEB.Models;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), AllowAnonymous]
    public class SurveysController : BaseApiController
    {
        public SurveysController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        private void Load(SurveyParams surveyParams, out Response response, out ActionResult result)
        {
            if (!string.IsNullOrWhiteSpace(surveyParams.PublicCode))
            {
                // accessing via public code
                response = db.Responses
                    .Include(o => o.Questionnaire)
                    .Include(o => o.Entity)
                    .Include(o => o.Date)
                    .FirstOrDefault(o => o.PublicCode == surveyParams.PublicCode);
            }
            else
            {
                // non-public code access: must be logged in
                if (CurrentUser == null) result = Unauthorized();
                response = CurrentUser.GetPermittedResponsesQuery()
                    .Include(o => o.Questionnaire)
                    .Include(o => o.Entity)
                    .Include(o => o.Date)
                    .FirstOrDefault(o => o.ResponseId == surveyParams.ResponseId);
            }

            if (response == null) result = NotFound();
            else if (response.OpenFrom.HasValue && DateTime.Today < response.OpenFrom) result = BadRequest("The questionnaire is not yet open for completion");
            else if (response.OpenTo.HasValue && DateTime.Today > response.OpenTo) result = BadRequest("The questionnaire is no longer open for completion");
            else result = null;
        }

        [HttpGet("questionnaires/{publicCode}")]
        public async Task<IActionResult> GetQuestionnaire([FromRoute] string publicCode)
        {
            if (string.IsNullOrWhiteSpace(publicCode)) return BadRequest("Questionnaire Public Code not provided");

            var questionnaires = await db.Questionnaires
                .Include(o => o.EntityType)
                .Where(o => o.PublicCode == publicCode)
                .Take(2)
                .ToListAsync();

            if (questionnaires.Count > 1) return BadRequest("Multiple Questionnaires found with the same Public Code");

            var questionnaire = questionnaires.FirstOrDefault();

            if (questionnaire == null) return NotFound();

            var entities = await db.Entities
                .Where(o => o.EntityTypeId == questionnaire.EntityTypeId)
                .OrderBy(o => o.Name)
                .ToListAsync();

            var dates = await db.Dates
                .Where(o => o.DateType == questionnaire.DateType)
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            return Ok(
                new
                {
                    questionnaire = ModelFactory.Create(questionnaire),
                    entities = entities.Select(o => ModelFactory.Create(o)),
                    dates = dates.Select(o => ModelFactory.Create(o))
                }
            );
        }

        [HttpPost("questionnaires/{publicCode}")]
        public async Task<IActionResult> StartQuestionnaire([FromRoute] string publicCode, [FromBody] StartModel startModel)
        {
            if (string.IsNullOrWhiteSpace(publicCode)) return BadRequest("Questionnaire Public Code not provided");

            var questionnaire = await db.Questionnaires
                .Include(o => o.EntityType)
                .FirstOrDefaultAsync(o => o.PublicCode == publicCode);

            if (questionnaire == null) return NotFound();

            var entity = await db.Entities.Include(o => o.EntityType).FirstOrDefaultAsync(o => o.EntityId == startModel.EntityId);
            if (entity == null) return BadRequest($"Invalid {questionnaire.EntityType.Name}");
            if (entity.EntityTypeId != questionnaire.EntityTypeId) return BadRequest($"Invalid Entity Type");

            var date = await db.Dates.FirstOrDefaultAsync(o => o.DateId == startModel.DateId);
            if (date == null) return BadRequest($"Invalid {questionnaire.DateType.Label()}");
            if (date.DateType != questionnaire.DateType) return BadRequest($"Invalid Date Type");

            if (!questionnaire.AllowMultiple && await db.Responses.AnyAsync(o => o.QuestionnaireId == questionnaire.QuestionnaireId && o.EntityId == entity.EntityId && o.DateId == date.DateId))
                return BadRequest($"A Questionnaire Response has already been created for the given {entity.EntityType.Name} and {date.DateType.Label()}");

            var response = new Response();

            response.CreatedOnUtc = DateTime.UtcNow;

            response.EntityId = entity.EntityId;
            response.DateId = date.DateId;
            response.QuestionnaireId = questionnaire.QuestionnaireId;
            response.PublicCode = Guid.NewGuid().ToShortCode();

            //todo: since it doesn't hydrate, a number of values aren't being set, e.g. openfrom & to
            //ModelFactory.Hydrate(response, responseDTO);

            db.Entry(response).State = EntityState.Added;

            if (questionnaire.CalculateProgress)
                await response.CalculateProgressAsync(db);

            await db.SaveChangesAsync();

            return Ok(ModelFactory.Create(response));
        }

        [HttpGet("responses")]
        public IActionResult GetResponse([FromQuery] SurveyParams surveyParams)
        {
            Load(surveyParams, out Response response, out ActionResult result);
            if (result != null) return result;

            return Ok(ModelFactory.Create(response));
        }

        [HttpGet("structure")]
        public async Task<IActionResult> LoadStructure([FromQuery] SurveyParams surveyParams)
        {
            Load(surveyParams, out Response response, out ActionResult result);
            if (result != null) return result;

            var questionnaire = await db.Questionnaires
                .FirstOrDefaultAsync(o => o.QuestionnaireId == response.QuestionnaireId);

            if (questionnaire == null)
                return NotFound();

            var sections = await db.Sections
                .Where(o => o.QuestionnaireId == response.QuestionnaireId)
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            var questions = await db.Questions
                .Where(o => o.Section.QuestionnaireId == response.QuestionnaireId)
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            var questionOptionGroups = await db.QuestionOptionGroups
                .Include(o => o.QuestionOptions.OrderBy(o => o.SortOrder).ThenBy(o => o.Value))
                .Where(o => o.Questions.Any(q => q.Section.QuestionnaireId == response.QuestionnaireId))
                .ToListAsync();

            var skipLogicOptions = await db.SkipLogicOptions
                .Where(o => o.Question.Section.QuestionnaireId == response.QuestionnaireId)
                .ToListAsync();

            return Ok(
                new
                {
                    questionnaire = ModelFactory.Create(questionnaire),
                    sections = sections.Select(o => ModelFactory.Create(o)),
                    questions = questions.Select(o => ModelFactory.Create(o)),
                    questionOptionGroups = questionOptionGroups.Select(o => ModelFactory.Create(o, false, true)),
                    skipLogicOptions = skipLogicOptions.Select(o => ModelFactory.Create(o, false, true)),
                }
            );
        }

        [HttpGet("questions/{questionId}/answer")]
        public async Task<IActionResult> GetAnswer([FromQuery] SurveyParams surveyParams, [FromRoute] Guid questionId)
        {
            Load(surveyParams, out Response response, out ActionResult result);
            if (result != null) return result;

            var answer = await db.Answers
                .Include(o => o.AnswerOptions)
                .Include(o => o.Question)
                .FirstOrDefaultAsync(o => o.ResponseId == response.ResponseId && o.QuestionId == questionId);

            List<Document> documents = null;

            if (answer == null)
            {
                answer = new Answer { AnswerId = Guid.Empty, ResponseId = response.ResponseId, QuestionId = questionId };
            }
            else
            {
                if (answer.Question.QuestionType == QuestionType.Document)
                {
                    // load the documents without the file contents
                    documents = await db.Documents.Where(o => o.ItemId == answer.AnswerId)
                        .OrderBy(o => o.FileName)
                        .ToListAsync();
                }
            }

            return Ok(new AnswerItemDTO(answer, documents));
        }

        [HttpPost("questions/{questionId}/answer")]
        public async Task<IActionResult> SaveAnswer([FromQuery] SurveyParams surveyParams, [FromRoute] Guid questionId, [FromBody] AnswerItemDTO answerDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            Load(surveyParams, out Response response, out ActionResult result);
            if (result != null) return result;

            if (response.Submitted) return BadRequest("The response cannot be modified as it has already been submitted");

            if (answerDTO.ResponseId != response.ResponseId) return BadRequest("Response Id mismatch");
            if (answerDTO.QuestionId != questionId) return BadRequest("Question Id mismatch");

            var question = await db.Questions.FirstOrDefaultAsync(o => o.QuestionId == questionId);
            if (question == null) return NotFound("Invalid Question Id");

            var isNew = answerDTO.AnswerId == Guid.Empty;

            Answer answer;
            if (isNew)
            {
                answer = new Answer();

                db.Entry(answer).State = EntityState.Added;
            }
            else
            {
                answer = await db.Answers
                    .Include(o => o.AnswerOptions)
                    .FirstOrDefaultAsync(o => o.AnswerId == answerDTO.AnswerId);

                if (answer == null)
                    return NotFound();

                db.Entry(answer).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(answer, answerDTO);

            if (question.QuestionType == QuestionType.OptionList)
            {
                if (question.OptionListType == OptionListType.Dropdown
                    || question.OptionListType == OptionListType.Rating
                    || question.OptionListType == OptionListType.RadioList)
                {
                    if (answerDTO.AnswerOptions.Count > 1) return BadRequest("Rating Questions cannot have more than one selected option");
                }
                else if (question.OptionListType == OptionListType.Checkboxes) { }
                else throw new NotImplementedException("OptionListType not implemented in Save");

                // for each incoming selected option:
                foreach (var incomingAO in answerDTO.AnswerOptions)
                {
                    // if it doesn't already exist, add it
                    if (!answer.AnswerOptions.Any(existingAO => existingAO.QuestionOptionId == incomingAO.QuestionOptionId))
                    {
                        db.Entry(new AnswerOption { QuestionOptionId = incomingAO.QuestionOptionId, AnswerId = incomingAO.AnswerId, Answer = answer }).State = EntityState.Added;
                    }
                }

                // for each existing selected option
                foreach (var existingAO in answer.AnswerOptions)
                {
                    // if it wasn't selecting in the incoming list, delete it
                    if (!answerDTO.AnswerOptions.Any(incomingAO => incomingAO.QuestionOptionId == existingAO.QuestionOptionId))
                        db.Entry(existingAO).State = EntityState.Deleted;
                }

                answer.Value = null;

                var answers = await db.Answers
                    .Include(o => o.AnswerOptions)
                    .Where(o => o.ResponseId == response.ResponseId)
                    .ToDictionaryAsync(o => o.QuestionId);

                if (answers.ContainsKey(answer.AnswerId))
                {
                    // is it necessary to update the loaded answer from the current answer?

                }

                var dependantQuestions = await db.Questions.Where(o => o.Section.QuestionnaireId == response.QuestionnaireId && o.CheckQuestionId == question.QuestionId).ToListAsync();
                var checkedQuestionIds = new HashSet<Guid>();
                foreach (var dependantQuestion in dependantQuestions)
                    await CheckDependantQuestionAsync(response.QuestionnaireId, dependantQuestion, answers, checkedQuestionIds);

            }
            else if (question.QuestionType == QuestionType.Document)
            {
                var item = await db.Items.FirstOrDefaultAsync(o => o.ItemId == answer.AnswerId);
                var documentIds = db.Documents
                    .Where(o => o.ItemId == answer.AnswerId)
                    .Select(o => o.DocumentId)
                    .ToHashSet();

                foreach (var documentId in documentIds.Where(o => !answerDTO.Documents.Any(d => d.DocumentId == o)))
                    db.Entry(new Document { DocumentId = documentId }).State = EntityState.Deleted;

                var documentsToSave = answerDTO.Documents.Where(o => o.DocumentId == Guid.Empty);
                if (documentsToSave.Any() && item == null)
                {
                    item = new Item();
                    item.ItemType = ItemType.Answer;
                    item.ItemId = answer.AnswerId;
                    db.Entry(item).State = EntityState.Added;
                }

                foreach (var documentDTO in documentsToSave)
                {
                    var document = new Document();
                    ModelFactory.Hydrate(document, documentDTO);
                    document.Item = item;
                    documentDTO.ItemId = item.ItemId;
                    if (CurrentUser.IsLoggedIn) document.UploadedById = CurrentUser.Id;
                    document.UploadedOn = DateTime.UtcNow;
                    document.Size = document.DocumentContent.FileContents.Length;
                    db.Entry(document).State = EntityState.Added;
                }

            }

            response.LastAnsweredOnUtc = DateTime.UtcNow;
            db.Entry(response).State = EntityState.Modified;

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                try
                {
                    await db.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    if (ex.InnerException != null && ex.InnerException is SqlException && ((SqlException)ex.InnerException).Number == 2601)
                        return BadRequest("ANSWEREXISTS");
                    else throw;
                }

                if (response.Questionnaire.CalculateProgress)
                {
                    await response.CalculateProgressAsync(db);
                    // todo: use a transaction?
                    db.Entry(response).State = EntityState.Modified;
                    await db.SaveChangesAsync();
                }

                transactionScope.Complete();
            }

            // return the progress values
            return Ok(
                new SurveyProgress()
                {
                    TotalQuestions = response.TotalQuestions,
                    ApplicableQuestions = response.ApplicableQuestions,
                    CompletedQuestions = response.CompletedQuestions
                });
        }

        private async System.Threading.Tasks.Task CheckDependantQuestionAsync(Guid questionnaireId, Question question, Dictionary<Guid, Answer> answers, HashSet<Guid> checkedQuestionIds)
        {
            if (checkedQuestionIds.Contains(question.QuestionId)) throw new Exception("Question Id has already been checked - circular dependancy?");
            checkedQuestionIds.Add(question.QuestionId);

            if (!question.ShouldShow(answers))
            {
                var answer = answers.GetValueOrDefault(question.QuestionId);
                if (answer != null)
                {
                    answer.Value = null;
                    // if the answer was added, setting it to modified will result in an error
                    db.Entry(answer).State = EntityState.Modified;
                    foreach (var answerOption in answer.AnswerOptions)
                        db.Entry(answerOption).State = EntityState.Deleted;

                    // for all answers modified, check if this impacts any further answers...
                    var dependantQuestions = await db.Questions.Where(o => o.Section.QuestionnaireId == questionnaireId && o.CheckQuestionId == question.QuestionId).ToListAsync();
                    foreach (var dependantQuestion in dependantQuestions)
                        await CheckDependantQuestionAsync(questionnaireId, dependantQuestion, answers, checkedQuestionIds);

                }
            }
        }

        [HttpPost("responses/{responseId}/submit"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Submit([FromRoute] Guid responseId)
        {
            var response = await db.Responses
                .Include(o => o.Questionnaire)
                .FirstOrDefaultAsync(o => o.ResponseId == responseId);

            if (response == null) return NotFound();

            if (!response.Questionnaire.UseSubmit) return BadRequest("Questionnaire does not require submitting");
            if (response.Submitted) return BadRequest("Response has already been submitted");

            if (response.Questionnaire.SubmitOnCompletion && response.CompletedQuestions < response.ApplicableQuestions) return BadRequest("The questionnaire has not been completed");

            response.SubmittedById = CurrentUser.Id;
            response.SubmittedOnUtc = DateTime.UtcNow;

            db.Entry(response).State = EntityState.Modified;
            await db.SaveChangesAsync();

            return GetResponse(new SurveyParams { ResponseId = responseId });
        }

        [HttpGet("documents/{documentId}")]
        public async Task<IActionResult> Document([FromQuery] SurveyParams surveyParams, [FromRoute] Guid documentId)
        {
            Load(surveyParams, out Response response, out ActionResult result);
            if (result != null) return result;

            var document = await db.Documents
                .FirstOrDefaultAsync(o => o.DocumentId == documentId);

            // itemId is the same as answerId
            var answer = await db.Answers
                .FirstOrDefaultAsync(o => o.AnswerId == document.ItemId);

            if (answer == null) return NotFound();

            if (answer.ResponseId != response.ResponseId) return BadRequest("Mismatched Response Id");

            return Download.GetFileContentResult(Response, document.FileName, document.DocumentContent.FileContents);
        }

        [HttpGet("questions/{questionId}/logic")]
        public async Task<IActionResult> GetLogic([FromQuery] SurveyParams surveyParams, [FromRoute] Guid questionId)
        {
            var question = await db.Questions
                .Include(o => o.SkipLogicOptions)
                .ThenInclude(o => o.QuestionOption)
                .Include(o => o.CheckQuestion)
                .FirstOrDefaultAsync(o => o.QuestionId == questionId);

            if (!CurrentUser.IsInRole(Roles.Administrator))
            {
                Load(surveyParams, out Response response, out ActionResult result);
                if (result != null) return result;

                if (question.Section.QuestionnaireId != response.QuestionnaireId) return BadRequest("Mismatch between QuestionnaireId on Response & Question");
            }

            return Ok(
                new
                {
                    question.CheckQuestionId,
                    CheckQuestion = ModelFactory.Create(question.CheckQuestion, false, false),
                    CheckOptions = question.SkipLogicOptions.Select(o => o.QuestionOption).Select(o => ModelFactory.Create(o)),
                    question.SkipLogicAction
                }
            );
        }
    }

    public class StartModel
    {
        public Guid EntityId { get; set; }
        public Guid DateId { get; set; }
    }

    public class SurveyProgress
    {
        public int TotalQuestions { get; set; }
        public int ApplicableQuestions { get; set; }
        public int CompletedQuestions { get; set; }
        public EntityDTO Entity { get; set; }
    }

    public class SurveyParams
    {
        public Guid? ResponseId { get; set; }
        public string PublicCode { get; set; }
    }

    public class AnswerItemDTO : AnswerDTO
    {
        public List<DocumentDTO> Documents { get; set; }

        public AnswerItemDTO() : base() { }

        public AnswerItemDTO(Answer answer, List<Document> documents) : base()
        {
            AnswerId = answer.AnswerId;
            ResponseId = answer.ResponseId;
            QuestionId = answer.QuestionId;
            Value = answer.Value;
            AnswerOptions = answer.AnswerOptions.Select(o => ModelFactory.Create(o)).ToList();
            Documents = documents == null ? null : documents.Select(o => ModelFactory.Create(o)).ToList();
        }
    }
}
