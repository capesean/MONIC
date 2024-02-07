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
    public class QuestionSummariesController : BaseApiController
    {
        public QuestionSummariesController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] QuestionSummarySearchOptions searchOptions)
        {
            IQueryable<QuestionSummary> results = db.QuestionSummaries;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Question.Section.Questionnaire);
                results = results.Include(o => o.Date);
            }

            if (searchOptions.QuestionId.HasValue) results = results.Where(o => o.QuestionId == searchOptions.QuestionId);
            if (searchOptions.DateId.HasValue) results = results.Where(o => o.DateId == searchOptions.DateId);

            results = results.OrderBy(o => o.QuestionId).ThenBy(o => o.DateId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{questionId:Guid}/{dateId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid questionId, Guid dateId)
        {
            var questionSummary = await db.QuestionSummaries
                .Include(o => o.Question.Section.Questionnaire)
                .Include(o => o.Date)
                .FirstOrDefaultAsync(o => o.QuestionId == questionId && o.DateId == dateId);

            if (questionSummary == null)
                return NotFound();

            return Ok(ModelFactory.Create(questionSummary));
        }

        [HttpPost("{questionId:Guid}/{dateId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid questionId, Guid dateId, [FromBody] QuestionSummaryDTO questionSummaryDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (questionSummaryDTO.QuestionId != questionId || questionSummaryDTO.DateId != dateId) return BadRequest("Id mismatch");

            var questionSummary = await db.QuestionSummaries
                .FirstOrDefaultAsync(o => o.QuestionId == questionSummaryDTO.QuestionId && o.DateId == questionSummaryDTO.DateId);
            var isNew = questionSummary == null;

            if (isNew)
            {
                questionSummary = new QuestionSummary();

                questionSummary.QuestionId = questionSummaryDTO.QuestionId;
                questionSummary.DateId = questionSummaryDTO.DateId;

                db.Entry(questionSummary).State = EntityState.Added;
            }
            else
            {
                db.Entry(questionSummary).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(questionSummary, questionSummaryDTO);

            await db.SaveChangesAsync();

            return await Get(questionSummary.QuestionId, questionSummary.DateId);
        }

        [HttpDelete("{questionId:Guid}/{dateId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid questionId, Guid dateId)
        {
            var questionSummary = await db.QuestionSummaries
                .FirstOrDefaultAsync(o => o.QuestionId == questionId && o.DateId == dateId);

            if (questionSummary == null)
                return NotFound();

            db.Entry(questionSummary).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
