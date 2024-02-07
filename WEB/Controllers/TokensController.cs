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
    public class TokensController : BaseApiController
    {
        public TokensController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] TokenSearchOptions searchOptions)
        {
            IQueryable<Token> results = db.Tokens;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.SourceIndicator.EntityType);
                results = results.Include(o => o.Indicator.EntityType);
            }

            if (searchOptions.IndicatorId.HasValue) results = results.Where(o => o.IndicatorId == searchOptions.IndicatorId);
            if (searchOptions.SourceIndicatorId.HasValue) results = results.Where(o => o.SourceIndicatorId == searchOptions.SourceIndicatorId);

            results = results.OrderBy(o => o.IndicatorId).ThenBy(o => o.TokenNumber);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{indicatorId:Guid}/{tokenNumber:int}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid indicatorId, short tokenNumber)
        {
            var token = await db.Tokens
                .Include(o => o.Indicator)
                .Include(o => o.SourceIndicator)
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId && o.TokenNumber == tokenNumber);

            if (token == null)
                return NotFound();

            return Ok(ModelFactory.Create(token));
        }

        [HttpPost("{indicatorId:Guid}/{tokenNumber:int}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid indicatorId, short tokenNumber, [FromBody] TokenDTO tokenDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (tokenDTO.IndicatorId != indicatorId || tokenDTO.TokenNumber != tokenNumber) return BadRequest("Id mismatch");

            var token = await db.Tokens
                .FirstOrDefaultAsync(o => o.IndicatorId == tokenDTO.IndicatorId && o.TokenNumber == tokenDTO.TokenNumber);
            var isNew = token == null;

            if (isNew)
            {
                token = new Token();

                token.IndicatorId = tokenDTO.IndicatorId;
                token.TokenNumber = tokenDTO.TokenNumber;

                db.Entry(token).State = EntityState.Added;
            }
            else
            {
                db.Entry(token).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(token, tokenDTO);

            await db.SaveChangesAsync();

            return await Get(token.IndicatorId, token.TokenNumber);
        }

        [HttpDelete("{indicatorId:Guid}/{tokenNumber:int}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid indicatorId, short tokenNumber)
        {
            var token = await db.Tokens
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId && o.TokenNumber == tokenNumber);

            if (token == null)
                return NotFound();

            db.Entry(token).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
