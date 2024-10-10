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
    public class AnswerOptionsController : BaseApiController
    {
        public AnswerOptionsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] AnswerOptionSearchOptions searchOptions)
        {
            IQueryable<AnswerOption> results = db.AnswerOptions;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Answer.Response.Questionnaire);
                results = results.Include(o => o.QuestionOption);
            }

            if (searchOptions.AnswerId.HasValue) results = results.Where(o => o.AnswerId == searchOptions.AnswerId);
            if (searchOptions.QuestionOptionId.HasValue) results = results.Where(o => o.QuestionOptionId == searchOptions.QuestionOptionId);

            results = results.OrderBy(o => o.AnswerId).ThenBy(o => o.QuestionOptionId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{answerId:Guid}/{questionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid answerId, Guid questionOptionId)
        {
            var answerOption = await db.AnswerOptions
                .Include(o => o.QuestionOption)
                .Include(o => o.Answer.Response.Questionnaire)
                .FirstOrDefaultAsync(o => o.AnswerId == answerId && o.QuestionOptionId == questionOptionId);

            if (answerOption == null)
                return NotFound();

            return Ok(ModelFactory.Create(answerOption));
        }

        [HttpPost("{answerId:Guid}/{questionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid answerId, Guid questionOptionId, [FromBody] AnswerOptionDTO answerOptionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (answerOptionDTO.AnswerId != answerId || answerOptionDTO.QuestionOptionId != questionOptionId) return BadRequest("Id mismatch");

            var answerOption = await db.AnswerOptions
                .FirstOrDefaultAsync(o => o.AnswerId == answerOptionDTO.AnswerId && o.QuestionOptionId == answerOptionDTO.QuestionOptionId);

            var isNew = answerOption == null;

            if (isNew)
            {
                answerOption = new AnswerOption();

                answerOption.AnswerId = answerOptionDTO.AnswerId;
                answerOption.QuestionOptionId = answerOptionDTO.QuestionOptionId;

                db.Entry(answerOption).State = EntityState.Added;
            }
            else
            {
                db.Entry(answerOption).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(answerOption, answerOptionDTO);

            await db.SaveChangesAsync();

            return await Get(answerOption.AnswerId, answerOption.QuestionOptionId);
        }

        [HttpDelete("{answerId:Guid}/{questionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid answerId, Guid questionOptionId)
        {
            var answerOption = await db.AnswerOptions
                .FirstOrDefaultAsync(o => o.AnswerId == answerId && o.QuestionOptionId == questionOptionId);

            if (answerOption == null)
                return NotFound();

            db.Entry(answerOption).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
