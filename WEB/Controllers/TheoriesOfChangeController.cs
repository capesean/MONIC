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
    public class TheoriesOfChangeController : BaseApiController
    {
        public TheoriesOfChangeController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] TheoryOfChangeSearchOptions searchOptions)
        {
            IQueryable<TheoryOfChange> results = db.TheoriesOfChange;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.TheoryOfChangeComponents);
                results = results.Include(o => o.Relationships);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{theoryOfChangeId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid theoryOfChangeId, [FromQuery] bool includeChildren = false)
        {
            TheoryOfChange theoryOfChange;

            if (includeChildren)
            {
                theoryOfChange = await db.TheoriesOfChange
                    .Include(o => o.TheoryOfChangeComponents)
                    .ThenInclude(o => o.Component)
                    .Include(o => o.Relationships)
                    .FirstOrDefaultAsync(o => o.TheoryOfChangeId == theoryOfChangeId);
            }
            else
            {
                theoryOfChange = await db.TheoriesOfChange
                    .FirstOrDefaultAsync(o => o.TheoryOfChangeId == theoryOfChangeId);
            }

            if (theoryOfChange == null)
                return NotFound();

            return Ok(ModelFactory.Create(theoryOfChange, true, includeChildren));
        }

        [HttpPost("{theoryOfChangeId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid theoryOfChangeId, [FromBody] TheoryOfChangeDTO theoryOfChangeDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (theoryOfChangeDTO.TheoryOfChangeId != theoryOfChangeId) return BadRequest("Id mismatch");

            if (await db.TheoriesOfChange.AnyAsync(o => o.Name == theoryOfChangeDTO.Name && o.TheoryOfChangeId != theoryOfChangeDTO.TheoryOfChangeId))
                return BadRequest("Name already exists.");

            var isNew = theoryOfChangeDTO.TheoryOfChangeId == Guid.Empty;

            TheoryOfChange theoryOfChange;
            if (isNew)
            {
                theoryOfChange = new TheoryOfChange();

                db.Entry(theoryOfChange).State = EntityState.Added;
            }
            else
            {
                theoryOfChange = await db.TheoriesOfChange
                    .FirstOrDefaultAsync(o => o.TheoryOfChangeId == theoryOfChangeDTO.TheoryOfChangeId);

                if (theoryOfChange == null)
                    return NotFound();

                db.Entry(theoryOfChange).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(theoryOfChange, theoryOfChangeDTO);

            await db.SaveChangesAsync();

            return await Get(theoryOfChange.TheoryOfChangeId);
        }

        [HttpDelete("{theoryOfChangeId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid theoryOfChangeId)
        {
            var theoryOfChange = await db.TheoriesOfChange
                .FirstOrDefaultAsync(o => o.TheoryOfChangeId == theoryOfChangeId);

            if (theoryOfChange == null)
                return NotFound();

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.TheoryOfChangeComponents.Where(o => o.TheoryOfChangeId == theoryOfChange.TheoryOfChangeId).ExecuteDeleteAsync();

            await db.Relationships.Where(o => o.TheoryOfChangeId == theoryOfChange.TheoryOfChangeId).ExecuteDeleteAsync();

            db.Entry(theoryOfChange).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpPost("{theoryOfChangeId:Guid}/theoryofchangecomponents"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> SaveTheoryOfChangeComponents(Guid theoryOfChangeId, [FromBody] Guid[] componentIds)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var theoryOfChangeComponents = await db.TheoryOfChangeComponents
                .Where(o => o.TheoryOfChangeId == theoryOfChangeId)
                .ToListAsync();

            foreach (var componentId in componentIds)
            {
                if (!theoryOfChangeComponents.Any(o => o.ComponentId == componentId))
                {
                    var theoryOfChangeComponent = new TheoryOfChangeComponent { TheoryOfChangeId = theoryOfChangeId, ComponentId = componentId };
                    db.Entry(theoryOfChangeComponent).State = EntityState.Added;
                }
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{theoryOfChangeId:Guid}/theoryofchangecomponents"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteTheoryOfChangeComponents(Guid theoryOfChangeId)
        {
            await db.TheoryOfChangeComponents.Where(o => o.TheoryOfChangeId == theoryOfChangeId).ExecuteDeleteAsync();

            return Ok();
        }

        [HttpDelete("{theoryOfChangeId:Guid}/relationships"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteRelationships(Guid theoryOfChangeId)
        {
            await db.Relationships.Where(o => o.TheoryOfChangeId == theoryOfChangeId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
