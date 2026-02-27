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
    public class ChartsController : BaseApiController
    {
        public ChartsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] ChartSearchOptions searchOptions)
        {
            IQueryable<Chart> results = db.Charts;

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{chartId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid chartId)
        {
            var chart = await db.Charts
                .FirstOrDefaultAsync(o => o.ChartId == chartId);

            if (chart == null)
                return NotFound();

            return Ok(ModelFactory.Create(chart));
        }

        [HttpPost("{chartId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid chartId, [FromBody] ChartDTO chartDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (chartDTO.ChartId != chartId) return BadRequest("Id mismatch");

            if (await db.Charts.AnyAsync(o => o.Name == chartDTO.Name && o.ChartId != chartDTO.ChartId))
                return BadRequest("Name already exists.");

            var isNew = chartDTO.ChartId == Guid.Empty;

            Chart chart;
            if (isNew)
            {
                chart = new Chart();

                db.Entry(chart).State = EntityState.Added;
            }
            else
            {
                chart = await db.Charts
                    .FirstOrDefaultAsync(o => o.ChartId == chartDTO.ChartId);

                if (chart == null)
                    return NotFound();

                db.Entry(chart).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(chart, chartDTO);

            await db.SaveChangesAsync();

            return await Get(chart.ChartId);
        }

        [HttpDelete("{chartId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid chartId)
        {
            var chart = await db.Charts
                .FirstOrDefaultAsync(o => o.ChartId == chartId);

            if (chart == null)
                return NotFound();

            db.Entry(chart).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost, Route("data")]
        public async Task<IActionResult> GetData(ChartSettings chartSettings)
        {
            var primaryAxisIndicators = await db.Indicators
                .Where(o => chartSettings.PrimaryAxisIndicatorIds.Contains(o.IndicatorId))
                .ToListAsync();

            var secondaryAxisIndicators = await db.Indicators
                .Where(o => chartSettings.SecondaryAxisIndicatorIds.Contains(o.IndicatorId))
                .ToListAsync();

            var indicators = primaryAxisIndicators.Union(secondaryAxisIndicators).Distinct();
            var indicatorIds = indicators.Select(o => o.IndicatorId).ToList();  


            //if (indicator.IndicatorType == IndicatorType.Group)
            //{
            //    var groupedIndicators = await db.Indicators.Where(o => o.GroupingIndicatorId == indicator.IndicatorId).ToListAsync();

            //    foreach (var gi in groupedIndicators)
            //        indicators.Add(gi);

            //    // load for the grouped indicators
            //    data = await db.Data
            //        .Where(o => o.Indicator.GroupingIndicatorId == chartSettings.IndicatorId)
            //        .Where(o => chartSettings.EntityIds.Count() == 0 || chartSettings.EntityIds.Contains(o.EntityId))
            //        .OrderByDescending(o => o.Date.SortOrder)
            //        .GroupBy(o => new { o.EntityId, o.IndicatorId })
            //        .Select(o => o.First())
            //        .ToListAsync();
            //}

            // todo: needs date param(s)
            var data = await db.Data
                    .Where(o => indicatorIds.Contains(o.IndicatorId))
                    .Where(o => chartSettings.EntityIds.Count() == 0 || chartSettings.EntityIds.Contains(o.EntityId))
                    .OrderByDescending(o => o.Date.SortOrder)
                    .GroupBy(o => new { o.EntityId, o.IndicatorId })
                    .Select(o => o.First())
                    .ToListAsync();

            var entityIds = chartSettings.EntityIds.Count() == 0 ? data.Select(o => o.EntityId).Distinct().ToList() : chartSettings.EntityIds.ToList();
            var dateIds = data.Select(o => o.DateId).Distinct().ToList();

            var entities = await db.Entities
                .Where(o => entityIds.Contains(o.EntityId))
                .ToListAsync();

            var dates = await db.Dates
                .Where(o => dateIds.Contains(o.DateId))
                .ToListAsync();

            return Ok(new
            {
                primaryAxisIndicators = primaryAxisIndicators.Select(o => ModelFactory.Create(o)),
                secondaryAxisIndicators = secondaryAxisIndicators.Select(o => ModelFactory.Create(o)),
                data = data.Select(o => ModelFactory.Create(o)),
                entities = entities.Select(o => ModelFactory.Create(o)),
                dates = dates.Select(o => ModelFactory.Create(o))
            });
        }
    }

    public class ChartSettings
    {
        public Guid[] PrimaryAxisIndicatorIds { get; set; } = [];
        public Guid[] SecondaryAxisIndicatorIds { get; set; } = [];
        public Guid[] EntityIds { get; set; } = [];
    }
}
