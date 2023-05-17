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
    public class TheoryOfChangeComponentsController : BaseApiController
    {
        public TheoryOfChangeComponentsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] TheoryOfChangeComponentSearchOptions searchOptions)
        {
            IQueryable<TheoryOfChangeComponent> results = db.TheoryOfChangeComponents;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.TheoryOfChange);
                results = results.Include(o => o.Component);
            }

            if (searchOptions.TheoryOfChangeId.HasValue) results = results.Where(o => o.TheoryOfChangeId == searchOptions.TheoryOfChangeId);
            if (searchOptions.ComponentId.HasValue) results = results.Where(o => o.ComponentId == searchOptions.ComponentId);

            results = results.OrderBy(o => o.TheoryOfChangeId).ThenBy(o => o.ComponentId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{theoryOfChangeId:Guid}/{componentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid theoryOfChangeId, Guid componentId)
        {
            var theoryOfChangeComponent = await db.TheoryOfChangeComponents
                .Include(o => o.TheoryOfChange)
                .Include(o => o.Component)
                .FirstOrDefaultAsync(o => o.TheoryOfChangeId == theoryOfChangeId && o.ComponentId == componentId);

            if (theoryOfChangeComponent == null)
                return NotFound();

            return Ok(ModelFactory.Create(theoryOfChangeComponent));
        }

        [HttpPost("{theoryOfChangeId:Guid}/{componentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid theoryOfChangeId, Guid componentId, [FromBody] TheoryOfChangeComponentDTO theoryOfChangeComponentDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (theoryOfChangeComponentDTO.TheoryOfChangeId != theoryOfChangeId || theoryOfChangeComponentDTO.ComponentId != componentId) return BadRequest("Id mismatch");

            var theoryOfChangeComponent = await db.TheoryOfChangeComponents
                .FirstOrDefaultAsync(o => o.TheoryOfChangeId == theoryOfChangeComponentDTO.TheoryOfChangeId && o.ComponentId == theoryOfChangeComponentDTO.ComponentId);
            var isNew = theoryOfChangeComponent == null;

            if (isNew)
            {
                theoryOfChangeComponent = new TheoryOfChangeComponent();

                theoryOfChangeComponent.TheoryOfChangeId = theoryOfChangeComponentDTO.TheoryOfChangeId;
                theoryOfChangeComponent.ComponentId = theoryOfChangeComponentDTO.ComponentId;

                db.Entry(theoryOfChangeComponent).State = EntityState.Added;
            }
            else
            {
                db.Entry(theoryOfChangeComponent).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(theoryOfChangeComponent, theoryOfChangeComponentDTO);

            await db.SaveChangesAsync();

            return await Get(theoryOfChangeComponent.TheoryOfChangeId, theoryOfChangeComponent.ComponentId);
        }

        [HttpDelete("{theoryOfChangeId:Guid}/{componentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid theoryOfChangeId, Guid componentId)
        {
            var theoryOfChangeComponent = await db.TheoryOfChangeComponents
                .FirstOrDefaultAsync(o => o.TheoryOfChangeId == theoryOfChangeId && o.ComponentId == componentId);

            if (theoryOfChangeComponent == null)
                return NotFound();

            db.Entry(theoryOfChangeComponent).State = EntityState.Deleted;

            foreach (var relationship in db.Relationships.Where(o => o.TheoryOfChangeId == theoryOfChangeId && o.SourceComponentId == componentId))
                db.Entry(relationship).State = EntityState.Deleted;

            foreach (var relationship in db.Relationships.Where(o => o.TheoryOfChangeId == theoryOfChangeId && o.TargetComponentId == componentId))
                db.Entry(relationship).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
