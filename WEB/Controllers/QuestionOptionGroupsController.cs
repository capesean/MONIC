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
    public class QuestionOptionGroupsController : BaseApiController
    {
        public QuestionOptionGroupsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] QuestionOptionGroupSearchOptions searchOptions)
        {
            IQueryable<QuestionOptionGroup> results = db.QuestionOptionGroups;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.QuestionOptions);
                results = results.Include(o => o.Questions);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            if (searchOptions.Shared.HasValue) results = results.Where(o => o.Shared == searchOptions.Shared);

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{questionOptionGroupId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid questionOptionGroupId)
        {
            var questionOptionGroup = await db.QuestionOptionGroups
                .FirstOrDefaultAsync(o => o.QuestionOptionGroupId == questionOptionGroupId);

            if (questionOptionGroup == null)
                return NotFound();

            return Ok(ModelFactory.Create(questionOptionGroup));
        }

        [HttpPost("{questionOptionGroupId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid questionOptionGroupId, [FromBody] QuestionOptionGroupDTO questionOptionGroupDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (questionOptionGroupDTO.QuestionOptionGroupId != questionOptionGroupId) return BadRequest("Id mismatch");

            if (await db.QuestionOptionGroups.AnyAsync(o => o.Name == questionOptionGroupDTO.Name && o.QuestionOptionGroupId != questionOptionGroupDTO.QuestionOptionGroupId))
                return BadRequest("Name already exists.");

            var isNew = questionOptionGroupDTO.QuestionOptionGroupId == Guid.Empty;

            QuestionOptionGroup questionOptionGroup;
            if (isNew)
            {
                questionOptionGroup = new QuestionOptionGroup();

                db.Entry(questionOptionGroup).State = EntityState.Added;
            }
            else
            {
                questionOptionGroup = await db.QuestionOptionGroups
                    .FirstOrDefaultAsync(o => o.QuestionOptionGroupId == questionOptionGroupDTO.QuestionOptionGroupId);

                if (questionOptionGroup == null)
                    return NotFound();

                db.Entry(questionOptionGroup).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(questionOptionGroup, questionOptionGroupDTO);

            await db.SaveChangesAsync();

            return await Get(questionOptionGroup.QuestionOptionGroupId);
        }

        [HttpDelete("{questionOptionGroupId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid questionOptionGroupId)
        {
            var questionOptionGroup = await db.QuestionOptionGroups
                .FirstOrDefaultAsync(o => o.QuestionOptionGroupId == questionOptionGroupId);

            if (questionOptionGroup == null)
                return NotFound();

            if (await db.Questions.AnyAsync(o => o.QuestionOptionGroupId == questionOptionGroup.QuestionOptionGroupId))
                return BadRequest("Unable to delete the question option group as it has related questions");

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.QuestionOptions.Where(o => o.QuestionOptionGroupId == questionOptionGroup.QuestionOptionGroupId).ExecuteDeleteAsync();

                db.Entry(questionOptionGroup).State = EntityState.Deleted;

                await db.SaveChangesAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

        [HttpDelete("{questionOptionGroupId:Guid}/questionoptions"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteQuestionOptions(Guid questionOptionGroupId)
        {
            if (await db.AnswerOptions.AnyAsync(o => o.QuestionOption.QuestionOptionGroupId == questionOptionGroupId))
                return BadRequest("Unable to delete the options as there are related answer options");

            if (await db.SkipLogicOptions.AnyAsync(o => o.QuestionOption.QuestionOptionGroupId == questionOptionGroupId))
                return BadRequest("Unable to delete the options as there are related skip logic options");

            await db.QuestionOptions.Where(o => o.QuestionOptionGroupId == questionOptionGroupId).ExecuteDeleteAsync();

            return Ok();
        }

        [HttpDelete("{questionOptionGroupId:Guid}/questions"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteQuestions(Guid questionOptionGroupId)
        {
            if (await db.Questions.AnyAsync(o => o.CheckQuestion.QuestionOptionGroupId == questionOptionGroupId))
                return BadRequest("Unable to delete the questions as there are related questions");

            if (await db.SkipLogicOptions.AnyAsync(o => o.Question.QuestionOptionGroupId == questionOptionGroupId))
                return BadRequest("Unable to delete the questions as there are related skip logic options");

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.Answers.Where(o => o.Question.QuestionOptionGroupId == questionOptionGroupId).ExecuteDeleteAsync();

                await db.QuestionSummaries.Where(o => o.Question.QuestionOptionGroupId == questionOptionGroupId).ExecuteDeleteAsync();

                await db.Questions.Where(o => o.QuestionOptionGroupId == questionOptionGroupId).ExecuteDeleteAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

    }
}
