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
    public class FieldsController : BaseApiController
    {
        public FieldsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] FieldSearchOptions searchOptions)
        {
            IQueryable<Field> results = db.Fields;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Group);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.FieldValues);
                results = results.Include(o => o.Options);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            if (searchOptions.FieldType.HasValue) results = results.Where(o => o.FieldType == searchOptions.FieldType);
            if (searchOptions.Organisation.HasValue) results = results.Where(o => o.Organisation == searchOptions.Organisation);
            if (searchOptions.Entity.HasValue) results = results.Where(o => o.Entity == searchOptions.Entity);
            if (searchOptions.Indicator.HasValue) results = results.Where(o => o.Indicator == searchOptions.Indicator);
            if (searchOptions.GroupId.HasValue) results = results.Where(o => o.GroupId == searchOptions.GroupId);

            results = results.OrderBy(o => o.Group.SortOrder).ThenBy(o => o.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{fieldId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid fieldId)
        {
            var field = await db.Fields
                .Include(o => o.Group)
                .FirstOrDefaultAsync(o => o.FieldId == fieldId);

            if (field == null)
                return NotFound();

            return Ok(ModelFactory.Create(field));
        }

        [HttpPost("{fieldId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid fieldId, [FromBody] FieldDTO fieldDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (fieldDTO.FieldId != fieldId) return BadRequest("Id mismatch");

            if (await db.Fields.AnyAsync(o => o.Name == fieldDTO.Name && o.FieldId != fieldDTO.FieldId))
                return BadRequest("Name already exists.");

            var isNew = fieldDTO.FieldId == Guid.Empty;

            Field field;
            if (isNew)
            {
                field = new Field();

                fieldDTO.SortOrder = (await db.Fields.MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(field).State = EntityState.Added;
            }
            else
            {
                field = await db.Fields
                    .FirstOrDefaultAsync(o => o.FieldId == fieldDTO.FieldId);

                if (field == null)
                    return NotFound();

                db.Entry(field).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(field, fieldDTO, isNew);

            await db.SaveChangesAsync();

            return await Get(field.FieldId);
        }

        [HttpDelete("{fieldId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid fieldId)
        {
            var field = await db.Fields
                .FirstOrDefaultAsync(o => o.FieldId == fieldId);

            if (field == null)
                return NotFound();

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.Options.Where(o => o.FieldId == field.FieldId).ExecuteDeleteAsync();

                await db.FieldValues.Where(o => o.FieldId == field.FieldId).ExecuteDeleteAsync();

                db.Entry(field).State = EntityState.Deleted;

                await db.SaveChangesAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromBody] Guid[] sortedIds)
        {
            var fields = await db.Fields
                .ToListAsync();
            if (fields.Count != sortedIds.Length) return BadRequest("Some of the fields could not be found");

            foreach (var field in fields)
            {
                db.Entry(field).State = EntityState.Modified;
                field.SortOrder = Array.IndexOf(sortedIds, field.FieldId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{fieldId:Guid}/options"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteOptions(Guid fieldId)
        {
            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.OptionValues.Where(o => o.Option.FieldId == fieldId).ExecuteDeleteAsync();

                await db.Options.Where(o => o.FieldId == fieldId).ExecuteDeleteAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

    }
}
