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
    public class QuestionOptionsController : BaseApiController
    {
        public QuestionOptionsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] QuestionOptionSearchOptions searchOptions)
        {
            IQueryable<QuestionOption> results = db.QuestionOptions;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.QuestionOptionGroup);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.SkipLogicOptions);
                results = results.Include(o => o.AnswerOptions);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Label.Contains(searchOptions.q));

            if (searchOptions.QuestionOptionGroupId.HasValue) results = results.Where(o => o.QuestionOptionGroupId == searchOptions.QuestionOptionGroupId);

            if (searchOptions.OrderBy == "sortorder")
                results = searchOptions.OrderByAscending ? results.OrderBy(o => o.SortOrder) : results.OrderByDescending(o => o.SortOrder);
            else
                results = results.OrderBy(o => o.SortOrder).ThenBy(o => o.Value);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{questionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid questionOptionId)
        {
            var questionOption = await db.QuestionOptions
                .Include(o => o.QuestionOptionGroup)
                .FirstOrDefaultAsync(o => o.QuestionOptionId == questionOptionId);

            if (questionOption == null)
                return NotFound();

            return Ok(ModelFactory.Create(questionOption));
        }

        [HttpPost("{questionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid questionOptionId, [FromBody] QuestionOptionDTO questionOptionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (questionOptionDTO.QuestionOptionId != questionOptionId) return BadRequest("Id mismatch");

            var isNew = questionOptionDTO.QuestionOptionId == Guid.Empty;

            QuestionOption questionOption;
            if (isNew)
            {
                questionOption = new QuestionOption();

                questionOptionDTO.SortOrder = (await db.QuestionOptions.Where(o => o.QuestionOptionGroupId == questionOptionDTO.QuestionOptionGroupId).MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(questionOption).State = EntityState.Added;
            }
            else
            {
                questionOption = await db.QuestionOptions
                    .FirstOrDefaultAsync(o => o.QuestionOptionId == questionOptionDTO.QuestionOptionId);

                if (questionOption == null)
                    return NotFound();

                db.Entry(questionOption).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(questionOption, questionOptionDTO);

            await db.SaveChangesAsync();

            return await Get(questionOption.QuestionOptionId);
        }

        [HttpDelete("{questionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid questionOptionId)
        {
            var questionOption = await db.QuestionOptions
                .FirstOrDefaultAsync(o => o.QuestionOptionId == questionOptionId);

            if (questionOption == null)
                return NotFound();

            if (await db.AnswerOptions.AnyAsync(o => o.QuestionOptionId == questionOption.QuestionOptionId))
                return BadRequest("Unable to delete the option as it has related answer options");

            if (await db.SkipLogicOptions.AnyAsync(o => o.CheckQuestionOptionId == questionOption.QuestionOptionId))
                return BadRequest("Unable to delete the option as it has related skip logic options");

            db.Entry(questionOption).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromQuery] Guid questionOptionGroupId, [FromBody] Guid[] sortedIds)
        {
            var questionOptions = await db.QuestionOptions
                .Where(o => o.QuestionOptionGroupId == questionOptionGroupId)
                .ToListAsync();
            if (questionOptions.Count != sortedIds.Length) return BadRequest("Some of the options could not be found");

            foreach (var questionOption in questionOptions)
            {
                db.Entry(questionOption).State = EntityState.Modified;
                questionOption.SortOrder = Array.IndexOf(sortedIds, questionOption.QuestionOptionId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
