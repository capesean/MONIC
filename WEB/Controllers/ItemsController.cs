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
    public class ItemsController : BaseApiController
    {
        public ItemsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] ItemSearchOptions searchOptions)
        {
            IQueryable<Item> results = db.Items;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Documents);
                results = results.Include(o => o.FieldValues);
                results = results.Include(o => o.OptionValues);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.ItemId.ToString().Contains(searchOptions.q));

            if (searchOptions.ItemType.HasValue) results = results.Where(o => o.ItemType == searchOptions.ItemType);

            results = results.OrderBy(o => o.ItemId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{itemId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid itemId)
        {
            var item = await db.Items
                .FirstOrDefaultAsync(o => o.ItemId == itemId);

            if (item == null)
                return NotFound();

            return Ok(ModelFactory.Create(item));
        }

        [HttpPost("{itemId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid itemId, [FromBody] ItemDTO itemDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (itemDTO.ItemId != itemId) return BadRequest("Id mismatch");

            var isNew = itemDTO.ItemId == Guid.Empty;

            Item item;
            if (isNew)
            {
                item = new Item();

                db.Entry(item).State = EntityState.Added;
            }
            else
            {
                item = await db.Items
                    .FirstOrDefaultAsync(o => o.ItemId == itemDTO.ItemId);

                if (item == null)
                    return NotFound();

                db.Entry(item).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(item, itemDTO);

            await db.SaveChangesAsync();

            return await Get(item.ItemId);
        }

        [HttpDelete("{itemId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid itemId)
        {
            var item = await db.Items
                .FirstOrDefaultAsync(o => o.ItemId == itemId);

            if (item == null)
                return NotFound();

            if (await db.FieldValues.AnyAsync(o => o.ItemId == item.ItemId))
                return BadRequest("Unable to delete the item as it has related field values");

            if (await db.OptionValues.AnyAsync(o => o.ItemId == item.ItemId))
                return BadRequest("Unable to delete the item as it has related option values");

            if (await db.Documents.AnyAsync(o => o.ItemId == item.ItemId))
                return BadRequest("Unable to delete the item as it has related documents");

            db.Entry(item).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{itemId:Guid}/optionvalues"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteOptionValues(Guid itemId)
        {
            await db.OptionValues.Where(o => o.ItemId == itemId).ExecuteDeleteAsync();

            return Ok();
        }

        [HttpDelete("{itemId:Guid}/documents"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteDocuments(Guid itemId)
        {
            await db.Documents.Where(o => o.ItemId == itemId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
