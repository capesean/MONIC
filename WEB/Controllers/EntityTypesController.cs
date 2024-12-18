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
    public class EntityTypesController : BaseApiController
    {
        public EntityTypesController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] EntityTypeSearchOptions searchOptions)
        {
            IQueryable<EntityType> results = db.EntityTypes;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Entities);
                results = results.Include(o => o.Questionnaires);
                results = results.Include(o => o.Indicators);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            results = results.OrderBy(o => o.SortOrder).ThenBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{entityTypeId:Guid}")]
        public async Task<IActionResult> Get(Guid entityTypeId)
        {
            var entityType = await db.EntityTypes
                .FirstOrDefaultAsync(o => o.EntityTypeId == entityTypeId);

            if (entityType == null)
                return NotFound();

            return Ok(ModelFactory.Create(entityType));
        }

        [HttpPost("{entityTypeId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid entityTypeId, [FromBody] EntityTypeDTO entityTypeDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (entityTypeDTO.EntityTypeId != entityTypeId) return BadRequest("Id mismatch");

            if (await db.EntityTypes.AnyAsync(o => o.Name == entityTypeDTO.Name && o.EntityTypeId != entityTypeDTO.EntityTypeId))
                return BadRequest("Name already exists.");

            if (await db.EntityTypes.AnyAsync(o => o.Plural == entityTypeDTO.Plural && o.EntityTypeId != entityTypeDTO.EntityTypeId))
                return BadRequest("Plural already exists.");

            var isNew = entityTypeDTO.EntityTypeId == Guid.Empty;

            EntityType entityType;
            if (isNew)
            {
                entityType = new EntityType();

                entityTypeDTO.SortOrder = (await db.EntityTypes.MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(entityType).State = EntityState.Added;
            }
            else
            {
                entityType = await db.EntityTypes
                    .FirstOrDefaultAsync(o => o.EntityTypeId == entityTypeDTO.EntityTypeId);

                if (entityType == null)
                    return NotFound();

                db.Entry(entityType).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(entityType, entityTypeDTO);

            await db.SaveChangesAsync();

            return await Get(entityType.EntityTypeId);
        }

        [HttpDelete("{entityTypeId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid entityTypeId)
        {
            var entityType = await db.EntityTypes
                .FirstOrDefaultAsync(o => o.EntityTypeId == entityTypeId);

            if (entityType == null)
                return NotFound();

            if (await db.Entities.AnyAsync(o => o.EntityTypeId == entityType.EntityTypeId))
                return BadRequest("Unable to delete the entity type as it has related entities");

            if (await db.Indicators.AnyAsync(o => o.EntityTypeId == entityType.EntityTypeId))
                return BadRequest("Unable to delete the entity type as it has related indicators");

            if (await db.Questionnaires.AnyAsync(o => o.EntityTypeId == entityType.EntityTypeId))
                return BadRequest("Unable to delete the entity type as it has related questionnaires");

            db.Entry(entityType).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromBody] Guid[] sortedIds)
        {
            var entityTypes = await db.EntityTypes
                .ToListAsync();
            if (entityTypes.Count != sortedIds.Length) return BadRequest("Some of the entity types could not be found");

            foreach (var entityType in entityTypes)
            {
                db.Entry(entityType).State = EntityState.Modified;
                entityType.SortOrder = Array.IndexOf(sortedIds, entityType.EntityTypeId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{entityTypeId:Guid}/entities"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteEntities(Guid entityTypeId)
        {
            if (await db.Data.AnyAsync(o => o.Entity.EntityTypeId == entityTypeId))
                return BadRequest("Unable to delete the entities as there are related data");

            if (await db.EntityLinks.AnyAsync(o => o.ChildEntity.EntityTypeId == entityTypeId))
                return BadRequest("Unable to delete the entities as there are related entity links");

            if (await db.EntityLinks.AnyAsync(o => o.ParentEntity.EntityTypeId == entityTypeId))
                return BadRequest("Unable to delete the entities as there are related entity links");

            if (await db.Users.AnyAsync(o => o.Entity.EntityTypeId == entityTypeId))
                return BadRequest("Unable to delete the entities as there are related users");

            if (await db.Responses.AnyAsync(o => o.Entity.EntityTypeId == entityTypeId))
                return BadRequest("Unable to delete the entities as there are related responses");

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.EntityPermissions.Where(o => o.Entity.EntityTypeId == entityTypeId).ExecuteDeleteAsync();

                foreach (var entity in db.Entities.Where(o => o.EntityTypeId == entityTypeId).ToList())
            {
                ItemFunctions.DeleteFields(db, entity.EntityId, true);
            }

            await db.Entities.Where(o => o.EntityTypeId == entityTypeId).ExecuteDeleteAsync();

            await db.SaveChangesAsync();

            transactionScope.Complete();

                transactionScope.Complete();
            }

            return Ok();
        }

        [HttpDelete("{entityTypeId:Guid}/questionnaires"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteQuestionnaires(Guid entityTypeId)
        {
            if (await db.Responses.AnyAsync(o => o.Questionnaire.EntityTypeId == entityTypeId))
                return BadRequest("Unable to delete the questionnaires as there are related responses");

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.Sections.Where(o => o.Questionnaire.EntityTypeId == entityTypeId).ExecuteDeleteAsync();

                await db.Questionnaires.Where(o => o.EntityTypeId == entityTypeId).ExecuteDeleteAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

    }
}
