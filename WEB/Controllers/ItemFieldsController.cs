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
    public class ItemFieldsController : BaseApiController
    {
        public ItemFieldsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] ItemFieldSearchOptions searchOptions)
        {
            IQueryable<ItemField> results = db.ItemFields;

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
            var itemField = await db.ItemFields
                .Include(o => o.Field)
                .Include(o => o.Item)
                .FirstOrDefaultAsync(o => o.ItemId == itemId && o.FieldId == fieldId);

            if (itemField == null)
                return NotFound();

            return Ok(ModelFactory.Create(itemField));
        }

        [HttpPost("{itemId:Guid}/{fieldId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid itemId, Guid fieldId, [FromBody] ItemFieldDTO itemFieldDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (itemFieldDTO.ItemId != itemId || itemFieldDTO.FieldId != fieldId) return BadRequest("Id mismatch");

            var itemField = await db.ItemFields
                .FirstOrDefaultAsync(o => o.ItemId == itemFieldDTO.ItemId && o.FieldId == itemFieldDTO.FieldId);

            var isNew = itemField == null;

            if (isNew)
            {
                itemField = new ItemField();

                itemField.ItemId = itemFieldDTO.ItemId;
                itemField.FieldId = itemFieldDTO.FieldId;

                db.Entry(itemField).State = EntityState.Added;
            }
            else
            {
                db.Entry(itemField).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(itemField, itemFieldDTO);

            await db.SaveChangesAsync();

            return await Get(itemField.ItemId, itemField.FieldId);
        }

        [HttpDelete("{itemId:Guid}/{fieldId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid itemId, Guid fieldId)
        {
            var itemField = await db.ItemFields
                .FirstOrDefaultAsync(o => o.ItemId == itemId && o.FieldId == fieldId);

            if (itemField == null)
                return NotFound();

            db.Entry(itemField).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
