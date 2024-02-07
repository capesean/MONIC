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
    public class ComponentIndicatorsController : BaseApiController
    {
        public ComponentIndicatorsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] ComponentIndicatorSearchOptions searchOptions)
        {
            IQueryable<ComponentIndicator> results = db.ComponentIndicators;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Component);
                results = results.Include(o => o.Indicator);
            }

            if (searchOptions.ComponentId.HasValue) results = results.Where(o => o.ComponentId == searchOptions.ComponentId);
            if (searchOptions.IndicatorId.HasValue) results = results.Where(o => o.IndicatorId == searchOptions.IndicatorId);

            results = results.OrderBy(o => o.ComponentId).ThenBy(o => o.IndicatorId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{componentId:Guid}/{indicatorId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid componentId, Guid indicatorId)
        {
            var componentIndicator = await db.ComponentIndicators
                .Include(o => o.Component)
                .Include(o => o.Indicator)
                .FirstOrDefaultAsync(o => o.ComponentId == componentId && o.IndicatorId == indicatorId);

            if (componentIndicator == null)
                return NotFound();

            return Ok(ModelFactory.Create(componentIndicator));
        }

        [HttpPost("{componentId:Guid}/{indicatorId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid componentId, Guid indicatorId, [FromBody] ComponentIndicatorDTO componentIndicatorDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (componentIndicatorDTO.ComponentId != componentId || componentIndicatorDTO.IndicatorId != indicatorId) return BadRequest("Id mismatch");

            var componentIndicator = await db.ComponentIndicators
                .FirstOrDefaultAsync(o => o.ComponentId == componentIndicatorDTO.ComponentId && o.IndicatorId == componentIndicatorDTO.IndicatorId);
            var isNew = componentIndicator == null;

            if (isNew)
            {
                componentIndicator = new ComponentIndicator();

                componentIndicator.ComponentId = componentIndicatorDTO.ComponentId;
                componentIndicator.IndicatorId = componentIndicatorDTO.IndicatorId;

                db.Entry(componentIndicator).State = EntityState.Added;
            }
            else
            {
                db.Entry(componentIndicator).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(componentIndicator, componentIndicatorDTO);

            await db.SaveChangesAsync();

            return await Get(componentIndicator.ComponentId, componentIndicator.IndicatorId);
        }

        [HttpDelete("{componentId:Guid}/{indicatorId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid componentId, Guid indicatorId)
        {
            var componentIndicator = await db.ComponentIndicators
                .FirstOrDefaultAsync(o => o.ComponentId == componentId && o.IndicatorId == indicatorId);

            if (componentIndicator == null)
                return NotFound();

            db.Entry(componentIndicator).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
