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
    public class IndicatorDatesController : BaseApiController
    {
        public IndicatorDatesController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] IndicatorDateSearchOptions searchOptions)
        {
            IQueryable<IndicatorDate> results = db.IndicatorDates;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Date);
                results = results.Include(o => o.Indicator);
            }

            if (searchOptions.IndicatorId.HasValue) results = results.Where(o => o.IndicatorId == searchOptions.IndicatorId);
            if (searchOptions.DateId.HasValue) results = results.Where(o => o.DateId == searchOptions.DateId);

            results = results.OrderByDescending(o => o.Date.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{indicatorId:Guid}/{dateId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid indicatorId, Guid dateId)
        {
            var indicatorDate = await db.IndicatorDates
                .Include(o => o.Date)
                .Include(o => o.Indicator)
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId && o.DateId == dateId);

            if (indicatorDate == null)
                return NotFound();

            return Ok(ModelFactory.Create(indicatorDate));
        }

        [HttpPost("{indicatorId:Guid}/{dateId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid indicatorId, Guid dateId, [FromBody] IndicatorDateDTO indicatorDateDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (indicatorDateDTO.IndicatorId != indicatorId || indicatorDateDTO.DateId != dateId) return BadRequest("Id mismatch");

            var indicatorDate = await db.IndicatorDates
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorDateDTO.IndicatorId && o.DateId == indicatorDateDTO.DateId);

            var isNew = indicatorDate == null;

            if (isNew)
            {
                indicatorDate = new IndicatorDate();

                indicatorDate.IndicatorId = indicatorDateDTO.IndicatorId;
                indicatorDate.DateId = indicatorDateDTO.DateId;

                db.Entry(indicatorDate).State = EntityState.Added;
            }
            else
            {
                db.Entry(indicatorDate).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(indicatorDate, indicatorDateDTO);

            await db.SaveChangesAsync();

            return await Get(indicatorDate.IndicatorId, indicatorDate.DateId);
        }

        [HttpDelete("{indicatorId:Guid}/{dateId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid indicatorId, Guid dateId)
        {
            var indicatorDate = await db.IndicatorDates
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId && o.DateId == dateId);

            if (indicatorDate == null)
                return NotFound();

            db.Entry(indicatorDate).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
