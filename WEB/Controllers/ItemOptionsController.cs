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
    public class ItemOptionsController : BaseApiController
    {
        public ItemOptionsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] ItemOptionSearchOptions searchOptions)
        {
            IQueryable<ItemOption> results = db.ItemOptions;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Option);
                results = results.Include(o => o.Item);
            }

            if (searchOptions.ItemId.HasValue) results = results.Where(o => o.ItemId == searchOptions.ItemId);
            if (searchOptions.OptionId.HasValue) results = results.Where(o => o.OptionId == searchOptions.OptionId);

            results = results.OrderBy(o => o.ItemId).ThenBy(o => o.OptionId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{itemId:Guid}/{optionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid itemId, Guid optionId)
        {
            var itemOption = await db.ItemOptions
                .Include(o => o.Item)
                .Include(o => o.Option)
                .FirstOrDefaultAsync(o => o.ItemId == itemId && o.OptionId == optionId);

            if (itemOption == null)
                return NotFound();

            return Ok(ModelFactory.Create(itemOption));
        }

        [HttpPost("{itemId:Guid}/{optionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid itemId, Guid optionId, [FromBody] ItemOptionDTO itemOptionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (itemOptionDTO.ItemId != itemId || itemOptionDTO.OptionId != optionId) return BadRequest("Id mismatch");

            var itemOption = await db.ItemOptions
                .FirstOrDefaultAsync(o => o.ItemId == itemOptionDTO.ItemId && o.OptionId == itemOptionDTO.OptionId);

            var isNew = itemOption == null;

            if (isNew)
            {
                itemOption = new ItemOption();

                itemOption.ItemId = itemOptionDTO.ItemId;
                itemOption.OptionId = itemOptionDTO.OptionId;

                db.Entry(itemOption).State = EntityState.Added;
            }
            else
            {
                db.Entry(itemOption).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(itemOption, itemOptionDTO);

            await db.SaveChangesAsync();

            return await Get(itemOption.ItemId, itemOption.OptionId);
        }

        [HttpDelete("{itemId:Guid}/{optionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid itemId, Guid optionId)
        {
            var itemOption = await db.ItemOptions
                .FirstOrDefaultAsync(o => o.ItemId == itemId && o.OptionId == optionId);

            if (itemOption == null)
                return NotFound();

            db.Entry(itemOption).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
