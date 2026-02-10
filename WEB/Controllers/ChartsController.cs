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
            var indicator = await db.Indicators
                .FirstOrDefaultAsync(o => o.IndicatorId == chartSettings.IndicatorId);

            if (indicator == null) return NotFound("Indicator not found.");

            var indicators = new List<Indicator> { indicator };

            List<Datum> data;

            if (indicator.IndicatorType == IndicatorType.Group)
            {
                var groupedIndicators = await db.Indicators.Where(o => o.GroupingIndicatorId == indicator.IndicatorId).ToListAsync();

                foreach (var gi in groupedIndicators)
                    indicators.Add(gi);

                // load for the grouped indicators
                data = await db.Data
                    .Where(o => o.Indicator.GroupingIndicatorId == chartSettings.IndicatorId)
                    .OrderByDescending(o => o.Date.SortOrder)
                    .GroupBy(o => new { o.EntityId, o.IndicatorId })
                    .Select(o => o.First())
                    .ToListAsync();
            }
            else
            {
                data = await db.Data
                    .Where(o => o.IndicatorId == chartSettings.IndicatorId)
                    .OrderByDescending(o => o.Date.SortOrder)
                    .GroupBy(o => o.EntityId)
                    .Select(o => o.First())
                    .ToListAsync();
            }

            if (chartSettings.IndicatorId2.HasValue)
            {
                var indicator2 = await db.Indicators
                    .FirstOrDefaultAsync(o => o.IndicatorId == chartSettings.IndicatorId2);

                if (indicator2 == null) return NotFound("Indicator 2 not found.");

                indicators.Add(indicator2);

                var data2 = await db.Data
                    .Where(o => o.IndicatorId == chartSettings.IndicatorId2)
                    .OrderByDescending(o => o.Date.SortOrder)
                    .GroupBy(o => o.EntityId)
                    .Select(o => o.First())
                    .ToListAsync();

                data.AddRange(data2);
            }

            var entityIds = data.Select(o => o.EntityId).Distinct().ToList();
            var dateIds = data.Select(o => o.DateId).Distinct().ToList();

            var entities = await db.Entities
                .Where(o => entityIds.Contains(o.EntityId))
                .ToListAsync();

            var dates = await db.Dates
                .Where(o => dateIds.Contains(o.DateId))
                .ToListAsync();

            return Ok(new
            {
                chartSettings.IndicatorId,
                chartSettings.IndicatorId2,
                indicators = indicators.Select(o => ModelFactory.Create(o)),
                data = data.Select(o => ModelFactory.Create(o)),
                entities = entities.Select(o => ModelFactory.Create(o)),
                dates = dates.Select(o => ModelFactory.Create(o))
            });
        }
    }

    public class ChartSettings
    {
        public Guid IndicatorId { get; set; }
        public Guid? IndicatorId2 { get; set; }
    }
}
