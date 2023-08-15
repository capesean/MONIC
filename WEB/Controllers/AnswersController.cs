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
    public class AnswersController : BaseApiController
    {
        public AnswersController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] AnswerSearchOptions searchOptions)
        {
            IQueryable<Answer> results = db.Answers;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Question);
                results = results.Include(o => o.Response.Questionnaire);
                results = results.Include(o => o.Response.Entity);
                results = results.Include(o => o.Response.Date);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.AnswerOptions);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Value.Contains(searchOptions.q));

            if (searchOptions.ResponseId.HasValue) results = results.Where(o => o.ResponseId == searchOptions.ResponseId);
            if (searchOptions.QuestionId.HasValue) results = results.Where(o => o.QuestionId == searchOptions.QuestionId);

            results = results.OrderBy(o => o.Question.Section.SortOrder).ThenBy(o => o.Question.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{answerId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid answerId)
        {
            var answer = await db.Answers
                .Include(o => o.Response.Questionnaire)
                .Include(o => o.Question)
                .FirstOrDefaultAsync(o => o.AnswerId == answerId);

            if (answer == null)
                return NotFound();

            return Ok(ModelFactory.Create(answer));
        }

        [HttpPost("{answerId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid answerId, [FromBody] AnswerDTO answerDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (answerDTO.AnswerId != answerId) return BadRequest("Id mismatch");

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
                    .FirstOrDefaultAsync(o => o.AnswerId == answerDTO.AnswerId);

                if (answer == null)
                    return NotFound();

                db.Entry(answer).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(answer, answerDTO);

            await db.SaveChangesAsync();

            return await Get(answer.AnswerId);
        }

        [HttpDelete("{answerId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid answerId)
        {
            var answer = await db.Answers
                .FirstOrDefaultAsync(o => o.AnswerId == answerId);

            if (answer == null)
                return NotFound();

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.AnswerOptions.Where(o => o.AnswerId == answer.AnswerId).ExecuteDeleteAsync();

            db.Entry(answer).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpDelete("{answerId:Guid}/answeroptions"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteAnswerOptions(Guid answerId)
        {
            foreach (var answerOption in db.AnswerOptions.Where(o => o.AnswerId == answerId).ToList())
                db.Entry(answerOption).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
