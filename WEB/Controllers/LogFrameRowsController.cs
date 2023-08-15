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
    public class LogFrameRowsController : BaseApiController
    {
        public LogFrameRowsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] LogFrameRowSearchOptions searchOptions)
        {
            IQueryable<LogFrameRow> results = db.LogFrameRows;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.LogFrame);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.LogFrameRowComponents)
                    .ThenInclude(o => o.Component);
                results = results.Include(o => o.LogFrameRowIndicators)
                    .ThenInclude(o => o.Indicator);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Description.Contains(searchOptions.q) || o.Indicators.Contains(searchOptions.q) || o.MeansOfVerification.Contains(searchOptions.q) || o.RisksAndAssumptions.Contains(searchOptions.q));

            if (searchOptions.LogFrameId.HasValue) results = results.Where(o => o.LogFrameId == searchOptions.LogFrameId);
            if (searchOptions.RowType.HasValue) results = results.Where(o => o.RowType == searchOptions.RowType);

            results = results.OrderBy(o => o.RowNumber);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{logFrameRowId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid logFrameRowId)
        {
            var logFrameRow = await db.LogFrameRows
                .Include(o => o.LogFrame)
                .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowId);

            if (logFrameRow == null)
                return NotFound();

            return Ok(ModelFactory.Create(logFrameRow));
        }

        [HttpPost("{logFrameRowId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid logFrameRowId, [FromBody] LogFrameRowDTO logFrameRowDTO, [FromQuery] bool saveChildren = false)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (logFrameRowDTO.LogFrameRowId != logFrameRowId) return BadRequest("Id mismatch");

            var isNew = logFrameRowDTO.LogFrameRowId == Guid.Empty;

            LogFrameRow logFrameRow;
            if (isNew)
            {
                logFrameRow = new LogFrameRow();

                logFrameRowDTO.RowNumber = (await db.LogFrameRows.Where(o => o.LogFrameId == logFrameRowDTO.LogFrameId).MaxAsync(o => (int?)o.RowNumber) ?? 0) + 1;

                db.Entry(logFrameRow).State = EntityState.Added;
            }
            else
            {
                logFrameRow = await db.LogFrameRows
                    .Include(o => o.LogFrameRowIndicators)
                    .Include(o => o.LogFrameRowComponents)
                    .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowDTO.LogFrameRowId);

                if (logFrameRow == null)
                    return NotFound();

                db.Entry(logFrameRow).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(logFrameRow, logFrameRowDTO);

            if (saveChildren)
            {
                // save indicators
                foreach (var lfriDTO in logFrameRowDTO.LogFrameRowIndicators)
                {
                    if (!logFrameRow.LogFrameRowIndicators.Any(o => o.IndicatorId == lfriDTO.IndicatorId))
                    {
                        var logFrameRowIndicator = new LogFrameRowIndicator();
                        logFrameRowIndicator.LogFrameRowId = logFrameRow.LogFrameRowId;
                        logFrameRowIndicator.IndicatorId = lfriDTO.IndicatorId;
                        ModelFactory.Hydrate(logFrameRowIndicator, lfriDTO);
                        db.Entry(logFrameRowIndicator).State = EntityState.Added;
                    }
                }
                foreach (var lfri in logFrameRow.LogFrameRowIndicators)
                {
                    if (!logFrameRowDTO.LogFrameRowIndicators.Any(lfriDTO => lfriDTO.IndicatorId == lfri.IndicatorId))
                        db.Entry(lfri).State = EntityState.Deleted;
                }

                // save components
                foreach (var lfrcDTO in logFrameRowDTO.LogFrameRowComponents)
                {
                    if (!logFrameRow.LogFrameRowComponents.Any(o => o.ComponentId == lfrcDTO.ComponentId))
                    {
                        var logFrameRowComponent = new LogFrameRowComponent();
                        logFrameRowComponent.LogFrameRowId = logFrameRow.LogFrameRowId;
                        logFrameRowComponent.ComponentId = lfrcDTO.ComponentId;
                        ModelFactory.Hydrate(logFrameRowComponent, lfrcDTO);
                        db.Entry(logFrameRowComponent).State = EntityState.Added;
                    }
                }
                foreach (var lfrc in logFrameRow.LogFrameRowComponents)
                {
                    if (!logFrameRowDTO.LogFrameRowComponents.Any(lfrcDTO => lfrcDTO.ComponentId == lfrc.ComponentId))
                        db.Entry(lfrc).State = EntityState.Deleted;
                }
            }

            await db.SaveChangesAsync();

            return await Get(logFrameRow.LogFrameRowId);
        }

        [HttpDelete("{logFrameRowId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid logFrameRowId)
        {
            var logFrameRow = await db.LogFrameRows
                .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowId);

            if (logFrameRow == null)
                return NotFound();

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.LogFrameRowIndicators.Where(o => o.LogFrameRowId == logFrameRow.LogFrameRowId).ExecuteDeleteAsync();

            await db.LogFrameRowComponents.Where(o => o.LogFrameRowId == logFrameRow.LogFrameRowId).ExecuteDeleteAsync();

            db.Entry(logFrameRow).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromQuery] Guid logFrameId, [FromBody] Guid[] sortedIds)
        {
            var logFrameRows = await db.LogFrameRows
                .Where(o => o.LogFrameId == logFrameId)
                .ToListAsync();
            if (logFrameRows.Count != sortedIds.Length) return BadRequest("Some of the logframe rows could not be found");

            foreach (var logFrameRow in logFrameRows)
            {
                db.Entry(logFrameRow).State = EntityState.Modified;
                logFrameRow.RowNumber = Array.IndexOf(sortedIds, logFrameRow.LogFrameRowId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("{logFrameRowId:Guid}/logframerowindicators"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> SaveLogFrameRowIndicators(Guid logFrameRowId, [FromBody] Guid[] indicatorIds)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var logFrameRowIndicators = await db.LogFrameRowIndicators
                .Where(o => o.LogFrameRowId == logFrameRowId)
                .ToListAsync();

            foreach (var indicatorId in indicatorIds)
            {
                if (!logFrameRowIndicators.Any(o => o.IndicatorId == indicatorId))
                {
                    var logFrameRowIndicator = new LogFrameRowIndicator { LogFrameRowId = logFrameRowId, IndicatorId = indicatorId };
                    db.Entry(logFrameRowIndicator).State = EntityState.Added;
                }
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("{logFrameRowId:Guid}/logframerowcomponents"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> SaveLogFrameRowComponents(Guid logFrameRowId, [FromBody] Guid[] componentIds)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var logFrameRowComponents = await db.LogFrameRowComponents
                .Where(o => o.LogFrameRowId == logFrameRowId)
                .ToListAsync();

            foreach (var componentId in componentIds)
            {
                if (!logFrameRowComponents.Any(o => o.ComponentId == componentId))
                {
                    var logFrameRowComponent = new LogFrameRowComponent { LogFrameRowId = logFrameRowId, ComponentId = componentId };
                    db.Entry(logFrameRowComponent).State = EntityState.Added;
                }
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{logFrameRowId:Guid}/logframerowindicators"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteLogFrameRowIndicators(Guid logFrameRowId)
        {
            await db.LogFrameRowIndicators.Where(o => o.LogFrameRowId == logFrameRowId).ExecuteDeleteAsync();

            return Ok();
        }

        [HttpDelete("{logFrameRowId:Guid}/logframerowcomponents"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteLogFrameRowComponents(Guid logFrameRowId)
        {
            await db.LogFrameRowComponents.Where(o => o.LogFrameRowId == logFrameRowId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
