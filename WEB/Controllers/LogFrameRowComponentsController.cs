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
    public class LogFrameRowComponentsController : BaseApiController
    {
        public LogFrameRowComponentsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] LogFrameRowComponentSearchOptions searchOptions)
        {
            IQueryable<LogFrameRowComponent> results = db.LogFrameRowComponents;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.LogFrameRow.LogFrame);
                results = results.Include(o => o.Component);
            }

            if (searchOptions.LogFrameRowId.HasValue) results = results.Where(o => o.LogFrameRowId == searchOptions.LogFrameRowId);
            if (searchOptions.ComponentId.HasValue) results = results.Where(o => o.ComponentId == searchOptions.ComponentId);

            results = results.OrderBy(o => o.LogFrameRowId).ThenBy(o => o.ComponentId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{logFrameRowId:Guid}/{componentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid logFrameRowId, Guid componentId)
        {
            var logFrameRowComponent = await db.LogFrameRowComponents
                .Include(o => o.LogFrameRow.LogFrame)
                .Include(o => o.Component)
                .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowId && o.ComponentId == componentId);

            if (logFrameRowComponent == null)
                return NotFound();

            return Ok(ModelFactory.Create(logFrameRowComponent));
        }

        [HttpPost("{logFrameRowId:Guid}/{componentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid logFrameRowId, Guid componentId, [FromBody] LogFrameRowComponentDTO logFrameRowComponentDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (logFrameRowComponentDTO.LogFrameRowId != logFrameRowId || logFrameRowComponentDTO.ComponentId != componentId) return BadRequest("Id mismatch");

            var logFrameRowComponent = await db.LogFrameRowComponents
                .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowComponentDTO.LogFrameRowId && o.ComponentId == logFrameRowComponentDTO.ComponentId);
            var isNew = logFrameRowComponent == null;

            if (isNew)
            {
                logFrameRowComponent = new LogFrameRowComponent();

                logFrameRowComponent.LogFrameRowId = logFrameRowComponentDTO.LogFrameRowId;
                logFrameRowComponent.ComponentId = logFrameRowComponentDTO.ComponentId;

                db.Entry(logFrameRowComponent).State = EntityState.Added;
            }
            else
            {
                db.Entry(logFrameRowComponent).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(logFrameRowComponent, logFrameRowComponentDTO);

            await db.SaveChangesAsync();

            return await Get(logFrameRowComponent.LogFrameRowId, logFrameRowComponent.ComponentId);
        }

        [HttpDelete("{logFrameRowId:Guid}/{componentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid logFrameRowId, Guid componentId)
        {
            var logFrameRowComponent = await db.LogFrameRowComponents
                .FirstOrDefaultAsync(o => o.LogFrameRowId == logFrameRowId && o.ComponentId == componentId);

            if (logFrameRowComponent == null)
                return NotFound();

            db.Entry(logFrameRowComponent).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
