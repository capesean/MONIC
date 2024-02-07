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
    public class EntityPermissionsController : BaseApiController
    {
        public EntityPermissionsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] EntityPermissionSearchOptions searchOptions)
        {
            IQueryable<EntityPermission> results = db.EntityPermissions;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.User);
                results = results.Include(o => o.Entity.EntityType);
            }

            if (searchOptions.UserId.HasValue) results = results.Where(o => o.UserId == searchOptions.UserId);
            if (searchOptions.EntityId.HasValue) results = results.Where(o => o.EntityId == searchOptions.EntityId);

            results = results.OrderBy(o => o.User.FirstName).ThenBy(o => o.Entity.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{entityPermissionId:Guid}")]
        public async Task<IActionResult> Get(Guid entityPermissionId)
        {
            var entityPermission = await db.EntityPermissions
                .Include(o => o.User)
                .Include(o => o.Entity)
                .FirstOrDefaultAsync(o => o.EntityPermissionId == entityPermissionId);

            if (entityPermission == null)
                return NotFound();

            return Ok(ModelFactory.Create(entityPermission));
        }

        [HttpPost("{entityPermissionId:Guid}")]
        public async Task<IActionResult> Save(Guid entityPermissionId, [FromBody] EntityPermissionDTO entityPermissionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (entityPermissionDTO.EntityPermissionId != entityPermissionId) return BadRequest("Id mismatch");

            if (CurrentUser.IsInRole(Roles.Administrator)) { }
            else if (CurrentUser.IsInRole(Roles.Manager) && (await db.Entities.FirstAsync(o => o.EntityId == entityPermissionDTO.EntityId)).OrganisationId == CurrentUser.OrganisationId && (await db.EntityPermissions.FirstAsync(o => o.EntityPermissionId == entityPermissionId)).Entity.OrganisationId == CurrentUser.OrganisationId) { }
            else return Forbid();

            if ((await db.Entities.FirstAsync(o => o.EntityId == entityPermissionDTO.EntityId)).OrganisationId != (await db.Users.FirstAsync(o => o.Id == entityPermissionDTO.UserId)).OrganisationId && !CurrentUser.AffiliatedEntityId.HasValue) return BadRequest("Organisation mismatch between entity and user");

            var isNew = entityPermissionDTO.EntityPermissionId == Guid.Empty;

            EntityPermission entityPermission;
            if (isNew)
            {
                entityPermission = new EntityPermission();

                db.Entry(entityPermission).State = EntityState.Added;
            }
            else
            {
                entityPermission = await db.EntityPermissions
                    .FirstOrDefaultAsync(o => o.EntityPermissionId == entityPermissionDTO.EntityPermissionId);

                if (entityPermission == null)
                    return NotFound();

                db.Entry(entityPermission).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(entityPermission, entityPermissionDTO);

            await db.SaveChangesAsync();

            return await Get(entityPermission.EntityPermissionId);
        }

        [HttpDelete("{entityPermissionId:Guid}")]
        public async Task<IActionResult> Delete(Guid entityPermissionId)
        {
            var entityPermission = await db.EntityPermissions
                .Include(o => o.Entity)
                .FirstOrDefaultAsync(o => o.EntityPermissionId == entityPermissionId);

            if (entityPermission == null)
                return NotFound();

            if (CurrentUser.IsInRole(Roles.Administrator)) { }
            else if (CurrentUser.IsInRole(Roles.Manager) && entityPermission.Entity.OrganisationId == CurrentUser.OrganisationId) { }
            else return Forbid();

            db.Entry(entityPermission).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
