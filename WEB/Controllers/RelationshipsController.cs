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
    public class RelationshipsController : BaseApiController
    {
        public RelationshipsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] RelationshipSearchOptions searchOptions)
        {
            IQueryable<Relationship> results = db.Relationships;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.SourceComponent);
                results = results.Include(o => o.TargetComponent);
                results = results.Include(o => o.TheoryOfChange);
            }

            if (searchOptions.TheoryOfChangeId.HasValue) results = results.Where(o => o.TheoryOfChangeId == searchOptions.TheoryOfChangeId);
            if (searchOptions.SourceComponentId.HasValue) results = results.Where(o => o.SourceComponentId == searchOptions.SourceComponentId);
            if (searchOptions.TargetComponentId.HasValue) results = results.Where(o => o.TargetComponentId == searchOptions.TargetComponentId);

            results = results.OrderBy(o => o.RelationshipId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{relationshipId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid relationshipId)
        {
            var relationship = await db.Relationships
                .Include(o => o.SourceComponent)
                .Include(o => o.TargetComponent)
                .Include(o => o.TheoryOfChange)
                .FirstOrDefaultAsync(o => o.RelationshipId == relationshipId);

            if (relationship == null)
                return NotFound();

            var item = await db.Items
               .Include(o => o.FieldValues)
               .Include(o => o.OptionValues)
               .FirstOrDefaultAsync(o => o.ItemId == relationshipId);

            return Ok(ModelFactory.Create(relationship, true, false, item));
        }

        [HttpPost("{relationshipId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid relationshipId, [FromBody] RelationshipDTO relationshipDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (relationshipDTO.RelationshipId != relationshipId) return BadRequest("Id mismatch");

            var isNew = relationshipDTO.RelationshipId == Guid.Empty;

            Relationship relationship;
            if (isNew)
            {
                relationship = new Relationship();

                db.Entry(new Item { ItemId = relationship.RelationshipId, ItemType = ItemType.Relationship }).State = EntityState.Added;

                db.Entry(relationship).State = EntityState.Added;
            }
            else
            {
                relationship = await db.Relationships
                    .FirstOrDefaultAsync(o => o.RelationshipId == relationshipDTO.RelationshipId);

                if (relationship == null)
                    return NotFound();

                db.Entry(relationship).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(relationship, relationshipDTO);

            await ItemFunctions.HydrateFieldsAsync(db, relationship.RelationshipId, relationshipDTO.FieldValues, relationshipDTO.OptionValues);

            await db.SaveChangesAsync();

            return await Get(relationship.RelationshipId);
        }

        [HttpDelete("{relationshipId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid relationshipId)
        {
            var relationship = await db.Relationships
                .FirstOrDefaultAsync(o => o.RelationshipId == relationshipId);

            if (relationship == null)
                return NotFound();

            ItemFunctions.DeleteFields(db, relationshipId, true);

            db.Entry(relationship).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
