using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using WEB.Models;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class QuestionsController : BaseApiController
    {
        public QuestionsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] QuestionSearchOptions searchOptions)
        {
            IQueryable<Question> results = db.Questions;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Section.Questionnaire);
                results = results.Include(o => o.QuestionOptionGroup);
                results = results.Include(o => o.CheckQuestion);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Answers);
                results = results.Include(o => o.QuestionSummaries);
                results = results.Include(o => o.SkipLogicOptions);
                results = results.Include(o => o.SkipLogicQuestions);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Code.Contains(searchOptions.q) || o.Text.Contains(searchOptions.q));

            if (searchOptions.QuestionnaireId.HasValue) results = results.Where(o => o.Section.QuestionnaireId == searchOptions.QuestionnaireId);
            if (searchOptions.SectionId.HasValue) results = results.Where(o => o.SectionId == searchOptions.SectionId);
            if (searchOptions.QuestionType.HasValue) results = results.Where(o => o.QuestionType == searchOptions.QuestionType);
            if (searchOptions.QuestionOptionGroupId.HasValue) results = results.Where(o => o.QuestionOptionGroupId == searchOptions.QuestionOptionGroupId);

            if (searchOptions.OrderBy == "sortorder")
                results = searchOptions.OrderByAscending ? results.OrderBy(o => o.SortOrder) : results.OrderByDescending(o => o.SortOrder);
            else
                results = results.OrderBy(o => o.Section.SortOrder).ThenBy(o => o.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{questionId:Guid}")]
        public async Task<IActionResult> Get(Guid questionId)
        {
            var question = await db.Questions
                .Include(o => o.QuestionOptionGroup)
                .Include(o => o.Section.Questionnaire)
                .Include(o => o.CheckQuestion)
                .FirstOrDefaultAsync(o => o.QuestionId == questionId);

            if (question == null)
                return NotFound();

            return Ok(ModelFactory.Create(question));
        }

        [HttpPost("{questionId:Guid}")]
        public async Task<IActionResult> Save(Guid questionId, [FromBody] QuestionDTO questionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (questionDTO.QuestionId != questionId) return BadRequest("Id mismatch");

            if (await db.Questions.AnyAsync(o => o.Section.Questionnaire.Sections.Any(s => s.SectionId == questionDTO.SectionId) && o.Code == questionDTO.Code && o.QuestionId != questionDTO.QuestionId))
                return BadRequest("Code already exists on this Questionnaire.");

            var isNew = questionDTO.QuestionId == Guid.Empty;

            Question question;
            if (isNew)
            {
                question = new Question();

                questionDTO.SortOrder = (await db.Questions.Where(o => o.SectionId == questionDTO.SectionId).MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(question).State = EntityState.Added;
            }
            else
            {
                question = await db.Questions
                    .Include(o => o.SkipLogicOptions)
                    .FirstOrDefaultAsync(o => o.QuestionId == questionDTO.QuestionId);

                if (question == null)
                    return NotFound();

                db.Entry(question).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(question, questionDTO);

            if (question.CheckQuestionId.HasValue)
            {
                if (!questionDTO.SkipLogicOptions.Any()) return BadRequest("If skip logic is used, at least one skip option must be provided");

                var skipLogicQuestion = await db.Questions
                    .Include(o => o.Section)
                    .FirstOrDefaultAsync(o => o.QuestionId == question.CheckQuestionId);

                if (skipLogicQuestion == null) return BadRequest("Skip logic (check) question not found");
                if (skipLogicQuestion.QuestionType != QuestionType.OptionList) return BadRequest("Skip logic (check) question must be of type Option List");
                var section = await db.Sections.FirstOrDefaultAsync(o => o.SectionId == questionDTO.SectionId);
                if (skipLogicQuestion.Section.QuestionnaireId != section.QuestionnaireId) return BadRequest("Skip logic (check) question must be on the same questionnaire as the current question");

                var existingOptionIds = question.SkipLogicOptions.Select(o => o.CheckQuestionOptionId).ToHashSet();

                foreach (var skipLogicOption in questionDTO.SkipLogicOptions)
                {
                    if (skipLogicOption.QuestionId != questionDTO.QuestionId) return BadRequest("Skip logic option must have the same Question Id as the current question");

                    if (!existingOptionIds.Contains(skipLogicOption.CheckQuestionOptionId))
                    {
                        var slo = new SkipLogicOption();
                        slo.QuestionId = question.QuestionId;
                        slo.CheckQuestionOptionId = skipLogicOption.CheckQuestionOptionId;
                        db.Entry(slo).State = EntityState.Added;
                    }
                }

                foreach (var existingOptionId in existingOptionIds)
                {
                    if (!questionDTO.SkipLogicOptions.Any(o => o.CheckQuestionOptionId == existingOptionId))
                    {
                        db.Entry(new SkipLogicOption { QuestionId = question.QuestionId, CheckQuestionOptionId = existingOptionId }).State = EntityState.Deleted;
                    }
                }
            }

            if (question.QuestionType == QuestionType.OptionList && (question.QuestionOptionGroupId == Guid.Empty || question.QuestionOptionGroupId == question.QuestionId))
            {
                if (!db.QuestionOptionGroups.Any(o => o.QuestionOptionGroupId == question.QuestionId))
                {
                    var qog = new QuestionOptionGroup();
                    qog.QuestionOptionGroupId = question.QuestionId;
                    qog.Name = question.QuestionId.ToString();
                    db.Entry(qog).State = EntityState.Added;
                    question.QuestionOptionGroupId = qog.QuestionOptionGroupId;
                }
            }

            await db.SaveChangesAsync();

            return await Get(question.QuestionId);
        }

        [HttpDelete("{questionId:Guid}")]
        public async Task<IActionResult> Delete(Guid questionId)
        {
            var question = await db.Questions
                .FirstOrDefaultAsync(o => o.QuestionId == questionId);

            if (question == null)
                return NotFound();

            if (await db.Questions.AnyAsync(o => o.CheckQuestionId == question.QuestionId))
                return BadRequest("Unable to delete the question as it has related questions");

            if (await db.SkipLogicOptions.AnyAsync(o => o.QuestionId == question.QuestionId))
                return BadRequest("Unable to delete the question as it has related skip logic options");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.Documents.Where(o => o.ItemId == question.QuestionId).ExecuteDeleteAsync();

            await db.Items.Where(o => o.ItemId == question.QuestionId).ExecuteDeleteAsync();

            await db.AnswerOptions.Where(o => o.Answer.QuestionId == question.QuestionId).ExecuteDeleteAsync();

            await db.Answers.Where(o => o.QuestionId == question.QuestionId).ExecuteDeleteAsync();

            await db.QuestionSummaries.Where(o => o.QuestionId == question.QuestionId).ExecuteDeleteAsync();

            db.Entry(question).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpPost("sort")]
        public async Task<IActionResult> Sort([FromQuery] Guid sectionId, [FromBody] Guid[] sortedIds)
        {
            var questions = await db.Questions
                .Where(o => o.SectionId == sectionId)
                .ToListAsync();
            if (questions.Count != sortedIds.Length) return BadRequest("Some of the questions could not be found");

            foreach (var question in questions)
            {
                db.Entry(question).State = EntityState.Modified;
                question.SortOrder = Array.IndexOf(sortedIds, question.QuestionId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{questionId:Guid}/answers")]
        public async Task<IActionResult> DeleteAnswers(Guid questionId)
        {
            await db.Answers.Where(o => o.QuestionId == questionId).ExecuteDeleteAsync();

            return Ok();
        }

        [HttpDelete("{questionId:Guid}/questionsummaries")]
        public async Task<IActionResult> DeleteQuestionSummaries(Guid questionId)
        {
            await db.QuestionSummaries.Where(o => o.QuestionId == questionId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
