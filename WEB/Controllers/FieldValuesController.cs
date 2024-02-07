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
    public class FieldValuesController : BaseApiController
    {
        public FieldValuesController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] FieldValueSearchOptions searchOptions)
        {
            IQueryable<FieldValue> results = db.FieldValues;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Field);
                results = results.Include(o => o.Item);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Value.Contains(searchOptions.q));

            if (searchOptions.ItemId.HasValue) results = results.Where(o => o.ItemId == searchOptions.ItemId);
            if (searchOptions.FieldId.HasValue) results = results.Where(o => o.FieldId == searchOptions.FieldId);

            results = results.OrderBy(o => o.ItemId).ThenBy(o => o.FieldId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{itemId:Guid}/{fieldId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid itemId, Guid fieldId)
        {
            var fieldValue = await db.FieldValues
                .Include(o => o.Field)
                .Include(o => o.Item)
                .FirstOrDefaultAsync(o => o.ItemId == itemId && o.FieldId == fieldId);

            if (fieldValue == null)
                return NotFound();

            return Ok(ModelFactory.Create(fieldValue));
        }

        [HttpPost("{itemId:Guid}/{fieldId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid itemId, Guid fieldId, [FromBody] FieldValueDTO fieldValueDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (fieldValueDTO.ItemId != itemId || fieldValueDTO.FieldId != fieldId) return BadRequest("Id mismatch");

            var fieldValue = await db.FieldValues
                .FirstOrDefaultAsync(o => o.ItemId == fieldValueDTO.ItemId && o.FieldId == fieldValueDTO.FieldId);
            var isNew = fieldValue == null;

            if (isNew)
            {
                fieldValue = new FieldValue();

                fieldValue.ItemId = fieldValueDTO.ItemId;
                fieldValue.FieldId = fieldValueDTO.FieldId;

                db.Entry(fieldValue).State = EntityState.Added;
            }
            else
            {
                db.Entry(fieldValue).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(fieldValue, fieldValueDTO);

            await db.SaveChangesAsync();

            return await Get(fieldValue.ItemId, fieldValue.FieldId);
        }

        [HttpDelete("{itemId:Guid}/{fieldId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid itemId, Guid fieldId)
        {
            var fieldValue = await db.FieldValues
                .FirstOrDefaultAsync(o => o.ItemId == itemId && o.FieldId == fieldId);

            if (fieldValue == null)
                return NotFound();

            db.Entry(fieldValue).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
