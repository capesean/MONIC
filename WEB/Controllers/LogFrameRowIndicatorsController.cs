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
    public class LogFrameRowIndicatorsController : BaseApiController
    {
        public LogFrameRowIndicatorsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] LogFrameRowIndicatorSearchOptions searchOptions)
        {
            IQueryable<LogFrameRowIndicator> results = db.LogFrameRowIndicators;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Indicator);
                results = results.Include(o => o.LogFrameRow.LogFrame);
            }

            if (searchOptions.LogFrameRowId.HasValue) results = results.Where(o => o.LogFrameRowId == searchOptions.LogFrameRowId);
            if (searchOptions.IndicatorId.HasValue) results = results.Where(o => o.IndicatorId == searchOptions.IndicatorId);
            if (searchOptions.LogFrameId.HasValue) results = results.Where(o => o.LogFrameRow.LogFrameId == searchOptions.LogFrameId);

            results = results.OrderBy(o => o.LogFrameRowId).ThenBy(o => o.IndicatorId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{logFrameRowId:Guid}/{indicatorId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid logFrameRowId, Guid indicatorId)
        {
            var logFrameRowIndicator = await db.LogFrameRowIndicators
                .Include(o => o.LogFrameRow.LogFrame)
                .Include(o => o.Indicator)
                .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowId && o.IndicatorId == indicatorId);

            if (logFrameRowIndicator == null)
                return NotFound();

            return Ok(ModelFactory.Create(logFrameRowIndicator));
        }

        [HttpPost("{logFrameRowId:Guid}/{indicatorId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid logFrameRowId, Guid indicatorId, [FromBody] LogFrameRowIndicatorDTO logFrameRowIndicatorDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (logFrameRowIndicatorDTO.LogFrameRowId != logFrameRowId || logFrameRowIndicatorDTO.IndicatorId != indicatorId) return BadRequest("Id mismatch");

            var logFrameRowIndicator = await db.LogFrameRowIndicators
                .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowIndicatorDTO.LogFrameRowId && o.IndicatorId == logFrameRowIndicatorDTO.IndicatorId);
            var isNew = logFrameRowIndicator == null;

            if (isNew)
            {
                logFrameRowIndicator = new LogFrameRowIndicator();

                logFrameRowIndicator.LogFrameRowId = logFrameRowIndicatorDTO.LogFrameRowId;
                logFrameRowIndicator.IndicatorId = logFrameRowIndicatorDTO.IndicatorId;

                db.Entry(logFrameRowIndicator).State = EntityState.Added;
            }
            else
            {
                db.Entry(logFrameRowIndicator).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(logFrameRowIndicator, logFrameRowIndicatorDTO);

            await db.SaveChangesAsync();

            return await Get(logFrameRowIndicator.LogFrameRowId, logFrameRowIndicator.IndicatorId);
        }

        [HttpDelete("{logFrameRowId:Guid}/{indicatorId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid logFrameRowId, Guid indicatorId)
        {
            var logFrameRowIndicator = await db.LogFrameRowIndicators
                .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowId && o.IndicatorId == indicatorId);

            if (logFrameRowIndicator == null)
                return NotFound();

            db.Entry(logFrameRowIndicator).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
