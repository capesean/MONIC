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
    public class OrganisationsController : BaseApiController
    {
        public OrganisationsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] OrganisationSearchOptions searchOptions)
        {
            IQueryable<Organisation> results = db.Organisations;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Entities);
                results = results.Include(o => o.Users);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Code.Contains(searchOptions.q));

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{organisationId:Guid}")]
        public async Task<IActionResult> Get(Guid organisationId)
        {
            var organisation = await db.Organisations
                .FirstOrDefaultAsync(o => o.OrganisationId == organisationId);

            if (organisation == null)
                return NotFound();

            var item = await db.Items
               .Include(o => o.FieldValues)
               .Include(o => o.OptionValues)
               .FirstOrDefaultAsync(o => o.ItemId == organisationId);

            var organisationDTO = ModelFactory.Create(organisation, true, false, item);

            //organisationDTO.Files = (await db.Files
            //    .Where(o => o.OrganisationId == organisation.OrganisationId)
            //    .Select(o => new File { FileId = o.FileId, FieldId = o.FieldId, FileName = o.FileName, UploadedOn = o.UploadedOn, OrganisationId = o.OrganisationId })
            //    .ToListAsync())
            //    .Select(o => ModelFactory.Create(o))
            //    .ToList();

            return Ok(organisationDTO);
        }

        [HttpPost("{organisationId:Guid}"), AuthorizeRoles(Roles.Administrator, Roles.Manager)]
        public async Task<IActionResult> Save(Guid organisationId, [FromBody] OrganisationDTO organisationDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (organisationDTO.OrganisationId != organisationId) return BadRequest("Id mismatch");

            if (!organisationDTO.ValidateFields(db, ItemType.Organisation, out var error)) { return BadRequest(error); }

            if (!CurrentUser.IsInRole(Roles.Administrator) && organisationId != CurrentUser.OrganisationId) return Forbid();

            if (await db.Organisations.AnyAsync(o => o.Name == organisationDTO.Name && o.OrganisationId != organisationDTO.OrganisationId))
                return BadRequest("Name already exists.");

            if (await db.Organisations.AnyAsync(o => o.Code == organisationDTO.Code && o.OrganisationId != organisationDTO.OrganisationId))
                return BadRequest("Code already exists.");

            var isNew = organisationDTO.OrganisationId == Guid.Empty;

            Organisation organisation;
            if (isNew)
            {
                organisation = new Organisation();

                db.Entry(new Item { ItemId = organisation.OrganisationId, ItemType = ItemType.Organisation }).State = EntityState.Added;

                db.Entry(organisation).State = EntityState.Added;
            }
            else
            {
                organisation = await db.Organisations
                    .FirstOrDefaultAsync(o => o.OrganisationId == organisationDTO.OrganisationId);

                if (organisation == null)
                    return NotFound();

                db.Entry(organisation).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(organisation, organisationDTO);

            await ItemFunctions.HydrateFieldsAsync(db, organisation.OrganisationId, organisationDTO.FieldValues, organisationDTO.OptionValues);

            await db.SaveChangesAsync();

            return await Get(organisation.OrganisationId);
        }

        [HttpDelete("{organisationId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid organisationId)
        {
            var organisation = await db.Organisations
                .FirstOrDefaultAsync(o => o.OrganisationId == organisationId);

            if (organisation == null)
                return NotFound();

            if (await db.Entities.AnyAsync(o => o.OrganisationId == organisation.OrganisationId))
                return BadRequest("Unable to delete the organisation as it has related entities");

            if (await db.Users.AnyAsync(o => o.OrganisationId == organisation.OrganisationId))
                return BadRequest("Unable to delete the organisation as it has related users");

            ItemFunctions.DeleteFields(db, organisationId, true);

            db.Entry(organisation).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{organisationId:Guid}/entities"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteEntities(Guid organisationId)
        {
            using var transactionScope = Utilities.General.CreateTransactionScope();

            foreach (var entity in db.Entities.Where(o => o.OrganisationId == organisationId).ToList())
            {
                ItemFunctions.DeleteFields(db, entity.EntityId, true);
            }

            await db.Entities.Where(o => o.OrganisationId == organisationId).ExecuteDeleteAsync();

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpDelete("{organisationId:Guid}/users"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteUsers(Guid organisationId)
        {
            await db.Users.Where(o => o.OrganisationId == organisationId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
