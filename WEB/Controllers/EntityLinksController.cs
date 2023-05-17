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
    public class EntityLinksController : BaseApiController
    {
        public EntityLinksController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] EntityLinkSearchOptions searchOptions)
        {
            IQueryable<EntityLink> results = db.EntityLinks;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.ChildEntity.EntityType);
                results = results.Include(o => o.ParentEntity.EntityType);
            }

            if (searchOptions.ChildEntityId.HasValue) results = results.Where(o => o.ChildEntityId == searchOptions.ChildEntityId);
            if (searchOptions.ParentEntityId.HasValue) results = results.Where(o => o.ParentEntityId == searchOptions.ParentEntityId);

            results = results.OrderBy(o => o.ChildEntityId).ThenBy(o => o.ParentEntityId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{childEntityId:Guid}/{parentEntityId:Guid}")]
        public async Task<IActionResult> Get(Guid childEntityId, Guid parentEntityId)
        {
            var entityLink = await db.EntityLinks
                .Include(o => o.ChildEntity)
                .Include(o => o.ParentEntity)
                .FirstOrDefaultAsync(o => o.ChildEntityId == childEntityId && o.ParentEntityId == parentEntityId);

            if (entityLink == null)
                return NotFound();

            return Ok(ModelFactory.Create(entityLink));
        }

        [HttpPost("{childEntityId:Guid}/{parentEntityId:Guid}")]
        public async Task<IActionResult> Save(Guid childEntityId, Guid parentEntityId, [FromBody] EntityLinkDTO entityLinkDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (parentEntityId == childEntityId) return BadRequest("An entity cannot link to itself");

            if (entityLinkDTO.ChildEntityId != childEntityId || entityLinkDTO.ParentEntityId != parentEntityId) return BadRequest("Id mismatch");

            if (CurrentUser.IsInRole(Roles.Administrator)) { }
            else if (CurrentUser.IsInRole(Roles.Manager) && ((await db.Entities.FirstAsync(o => o.EntityId == entityLinkDTO.ChildEntityId)).OrganisationId != CurrentUser.OrganisationId || (await db.Entities.FirstAsync(o => o.EntityId == entityLinkDTO.ParentEntityId)).OrganisationId != CurrentUser.OrganisationId)) return Forbid();
            else return Forbid();

            var entityLink = await db.EntityLinks
                .FirstOrDefaultAsync(o => o.ChildEntityId == entityLinkDTO.ChildEntityId && o.ParentEntityId == entityLinkDTO.ParentEntityId);
            var isNew = entityLink == null;

            if (!isNew)
                return BadRequest("The entity link already exists");

            entityLink = new EntityLink();

            entityLink.ChildEntityId = entityLinkDTO.ChildEntityId;
            entityLink.ParentEntityId = entityLinkDTO.ParentEntityId;

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);
            await calculation.ChangeEntityLinkAsync(entityLink, Calculation.EntityLinkChangeType.Add);

            return await Get(entityLink.ChildEntityId, entityLink.ParentEntityId);
        }

        [HttpDelete("{childEntityId:Guid}/{parentEntityId:Guid}")]
        public async Task<IActionResult> Delete(Guid childEntityId, Guid parentEntityId)
        {
            var entityLink = await db.EntityLinks
                .Include(o => o.ChildEntity)
                .Include(o => o.ParentEntity)
                .FirstOrDefaultAsync(o => o.ChildEntityId == childEntityId && o.ParentEntityId == parentEntityId);

            if (entityLink == null)
                return NotFound();

            if (CurrentUser.IsInRole(Roles.Administrator)) { }
            else if (CurrentUser.IsInRole(Roles.Manager) && (entityLink.ChildEntity.OrganisationId != CurrentUser.OrganisationId || entityLink.ParentEntity.OrganisationId != CurrentUser.OrganisationId)) return Forbid();
            else return Forbid();

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);
            await calculation.ChangeEntityLinkAsync(entityLink, Calculation.EntityLinkChangeType.Remove);

            return Ok();
        }

    }
}
