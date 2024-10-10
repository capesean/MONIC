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
    public class SkipLogicOptionsController : BaseApiController
    {
        public SkipLogicOptionsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] SkipLogicOptionSearchOptions searchOptions)
        {
            IQueryable<SkipLogicOption> results = db.SkipLogicOptions;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.QuestionOption);
                results = results.Include(o => o.Question);
            }

            if (searchOptions.QuestionId.HasValue) results = results.Where(o => o.QuestionId == searchOptions.QuestionId);
            if (searchOptions.CheckQuestionOptionId.HasValue) results = results.Where(o => o.CheckQuestionOptionId == searchOptions.CheckQuestionOptionId);

            results = results.OrderBy(o => o.QuestionId).ThenBy(o => o.CheckQuestionOptionId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{questionId:Guid}/{checkQuestionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid questionId, Guid checkQuestionOptionId)
        {
            var skipLogicOption = await db.SkipLogicOptions
                .Include(o => o.QuestionOption)
                .Include(o => o.Question)
                .FirstOrDefaultAsync(o => o.QuestionId == questionId && o.CheckQuestionOptionId == checkQuestionOptionId);

            if (skipLogicOption == null)
                return NotFound();

            return Ok(ModelFactory.Create(skipLogicOption));
        }

        [HttpPost("{questionId:Guid}/{checkQuestionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid questionId, Guid checkQuestionOptionId, [FromBody] SkipLogicOptionDTO skipLogicOptionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (skipLogicOptionDTO.QuestionId != questionId || skipLogicOptionDTO.CheckQuestionOptionId != checkQuestionOptionId) return BadRequest("Id mismatch");

            var skipLogicOption = await db.SkipLogicOptions
                .FirstOrDefaultAsync(o => o.QuestionId == skipLogicOptionDTO.QuestionId && o.CheckQuestionOptionId == skipLogicOptionDTO.CheckQuestionOptionId);

            var isNew = skipLogicOption == null;

            if (isNew)
            {
                skipLogicOption = new SkipLogicOption();

                skipLogicOption.QuestionId = skipLogicOptionDTO.QuestionId;
                skipLogicOption.CheckQuestionOptionId = skipLogicOptionDTO.CheckQuestionOptionId;

                db.Entry(skipLogicOption).State = EntityState.Added;
            }
            else
            {
                db.Entry(skipLogicOption).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(skipLogicOption, skipLogicOptionDTO);

            await db.SaveChangesAsync();

            return await Get(skipLogicOption.QuestionId, skipLogicOption.CheckQuestionOptionId);
        }

        [HttpDelete("{questionId:Guid}/{checkQuestionOptionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid questionId, Guid checkQuestionOptionId)
        {
            var skipLogicOption = await db.SkipLogicOptions
                .FirstOrDefaultAsync(o => o.QuestionId == questionId && o.CheckQuestionOptionId == checkQuestionOptionId);

            if (skipLogicOption == null)
                return NotFound();

            db.Entry(skipLogicOption).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
