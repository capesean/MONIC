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
    public class EntitiesController : BaseApiController
    {
        public EntitiesController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpPost]
        public async Task<IActionResult> Search([FromBody] EntitySearchOptions searchOptions)
        {
            IQueryable<Entity> results = CurrentUser.GetPermittedEntitiesQuery();

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Organisation);
                results = results.Include(o => o.EntityType);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.ParentEntities);
                results = results.Include(o => o.ChildEntities);
                results = results.Include(o => o.Data);
                results = results.Include(o => o.EntityPermissions);
                results = results.Include(o => o.Responses);
                results = results.Include(o => o.AffiliatedUsers);
            }

            var permittedEntityIds = CurrentUser.GetPermittedEntityIds();
            results = results.Where(o => (!CurrentUser.OrganisationId.HasValue || o.OrganisationId == CurrentUser.OrganisationId) && permittedEntityIds.Contains(o.EntityId));

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Code.Contains(searchOptions.q) || o.ShortName.Contains(searchOptions.q));

            if (searchOptions.EntityIds.Any()) results = results.Where(o => searchOptions.EntityIds.Contains(o.EntityId));
            if (searchOptions.EntityTypeId.HasValue) results = results.Where(o => o.EntityTypeId == searchOptions.EntityTypeId);
            if (searchOptions.OrganisationId.HasValue) results = results.Where(o => o.OrganisationId == searchOptions.OrganisationId);
            if (searchOptions.Disabled.HasValue) results = results.Where(o => o.Disabled == searchOptions.Disabled);
            if (searchOptions.ParentEntityId.HasValue) results = results.Where(o => o.ParentEntities.Any(el => el.ParentEntityId == searchOptions.ParentEntityId));

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{entityId:Guid}")]
        public async Task<IActionResult> Get(Guid entityId, Roles? role = null)
        {
            var entity = await db.Entities
                .Include(o => o.Organisation)
                .Include(o => o.EntityType)
                .FirstOrDefaultAsync(o => o.EntityId == entityId);

            if (entity == null)
                return NotFound();

            if (role.HasValue)
            {
                if (role == Roles.Administrator && CurrentUser.IsInRole(Roles.Administrator))
                {
                    // allow
                }
                else if (role == Roles.Manager && CurrentUser.IsInRole(Roles.Manager))
                {
                    // allow
                }
                else
                {
                    return Forbid();
                }
            }
            else if (!CurrentUser.HasEntityPermission(entity.EntityId)) return Forbid();

            var item = await db.Items
               .Include(o => o.FieldValues)
               .Include(o => o.OptionValues)
               .FirstOrDefaultAsync(o => o.ItemId == entityId);

            var entityDTO = ModelFactory.Create(entity, true, false, item);

            //organisationDTO.Files = (await db.Files
            //    .Where(o => o.EntityId == entity.EntityId)
            //    .Select(o => new File { FileId = o.FileId, FieldId = o.FieldId, FileName = o.FileName, UploadedOn = o.UploadedOn, OrganisationId = o.OrganisationId })
            //    .ToListAsync())
            //    .Select(o => ModelFactory.Create(o))
            //    .ToList();

            return Ok(entityDTO);
        }

        [HttpPost("{entityId:Guid}")]
        public async Task<IActionResult> Save(Guid entityId, [FromBody] EntityDTO entityDTO)
        {
            if (!CurrentUser.IsInRole(Roles.Administrator) && !(CurrentUser.IsInRole(Roles.Manager) && entityDTO.OrganisationId == CurrentUser.OrganisationId))
                return Forbid();

            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!entityDTO.ValidateFields(db, ItemType.Entity, out var error)) { return BadRequest(error); }

            if (entityDTO.EntityId != entityId) return BadRequest("Id mismatch");

            if (await db.Entities.AnyAsync(o => o.Name == entityDTO.Name && o.EntityId != entityDTO.EntityId && o.OrganisationId == entityDTO.OrganisationId))
                return BadRequest("Name already exists.");

            if (await db.Entities.AnyAsync(o => o.Code == entityDTO.Code && o.EntityId != entityDTO.EntityId && o.OrganisationId == entityDTO.OrganisationId))
                return BadRequest("Code already exists.");

            if (await db.Entities.AnyAsync(o => o.ShortName == entityDTO.ShortName && o.EntityId != entityDTO.EntityId && o.OrganisationId == entityDTO.OrganisationId))
                return BadRequest("Short Name already exists.");

            var isNew = entityDTO.EntityId == Guid.Empty;

            Entity entity;
            if (isNew)
            {
                entity = new Entity();

                db.Entry(new Item { ItemId = entity.EntityId, ItemType = ItemType.Entity }).State = EntityState.Added;

                db.Entry(entity).State = EntityState.Added;
            }
            else
            {
                entity = await db.Entities
                    .FirstOrDefaultAsync(o => o.EntityId == entityDTO.EntityId);

                if (entity == null)
                    return NotFound();

                db.Entry(entity).State = EntityState.Modified;
            }

            await Permissions.SetEntityPermissionsAsync(db, AppSettings, entityDTO.OrganisationId, entity.EntityId);

            ModelFactory.Hydrate(entity, entityDTO);

            await ItemFunctions.HydrateFieldsAsync(db, entity.EntityId, entityDTO.FieldValues, entityDTO.OptionValues);

            if (!CurrentUser.IsInRole(Roles.Administrator)) entity.OrganisationId = CurrentUser.OrganisationId.Value;

            await db.SaveChangesAsync();

            return await Get(entity.EntityId, CurrentUser.IsInRole(Roles.Manager) ? Roles.Manager : Roles.Administrator);
        }

        [HttpDelete("{entityId:Guid}")]
        public async Task<IActionResult> Delete(Guid entityId)
        {
            var entity = await db.Entities
                .FirstOrDefaultAsync(o => o.EntityId == entityId);

            if (entity == null)
                return NotFound();

            if (await db.Data.AnyAsync(o => o.EntityId == entity.EntityId))
                return BadRequest("Unable to delete the entity as it has related data");

            if (await db.EntityLinks.AnyAsync(o => o.ChildEntityId == entity.EntityId))
                return BadRequest("Unable to delete the entity as it has related entity links");

            if (await db.EntityLinks.AnyAsync(o => o.ParentEntityId == entity.EntityId))
                return BadRequest("Unable to delete the entity as it has related entity links");

            if (await db.Users.AnyAsync(o => o.AffiliatedEntityId == entity.EntityId))
                return BadRequest("Unable to delete the entity as it has related users");

            if (await db.Responses.AnyAsync(o => o.EntityId == entity.EntityId))
                return BadRequest("Unable to delete the entity as it has related responses");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.EntityPermissions.Where(o => o.EntityId == entity.EntityId).ExecuteDeleteAsync();

            ItemFunctions.DeleteFields(db, entityId, true);

            db.Entry(entity).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpPost("{entityId:Guid}/setdisabled/{value:bool}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> SetDisabled(Guid entityId, [FromRoute] bool value)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entity = await db.Entities
                .Include(o => o.ChildEntities)
                .ThenInclude(o => o.ChildEntity)
                .FirstOrDefaultAsync(o => o.EntityId == entityId);

            if (entity == null)
                return NotFound();

            entity.Disabled = value;
            db.Entry(entity).State = EntityState.Modified;

            foreach (var childEntity in entity.ChildEntities.Select(o => o.ChildEntity))
            {
                childEntity.Disabled = value;
                db.Entry(childEntity).State = EntityState.Modified;
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{entityId:Guid}/entitypermissions")]
        public async Task<IActionResult> DeleteEntityPermissions(Guid entityId)
        {
            foreach (var entityPermission in db.EntityPermissions.Where(o => o.EntityId == entityId).ToList())
                db.Entry(entityPermission).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{entityId:Guid}/responses")]
        public async Task<IActionResult> DeleteResponses(Guid entityId)
        {
            foreach (var response in db.Responses.Where(o => o.EntityId == entityId).ToList())
                db.Entry(response).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
