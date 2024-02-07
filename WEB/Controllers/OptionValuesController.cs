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
    public class OptionValuesController : BaseApiController
    {
        public OptionValuesController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] OptionValueSearchOptions searchOptions)
        {
            IQueryable<OptionValue> results = db.OptionValues;

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
            var optionValue = await db.OptionValues
                .Include(o => o.Item)
                .Include(o => o.Option)
                .FirstOrDefaultAsync(o => o.ItemId == itemId && o.OptionId == optionId);

            if (optionValue == null)
                return NotFound();

            return Ok(ModelFactory.Create(optionValue));
        }

        [HttpPost("{itemId:Guid}/{optionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid itemId, Guid optionId, [FromBody] OptionValueDTO optionValueDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (optionValueDTO.ItemId != itemId || optionValueDTO.OptionId != optionId) return BadRequest("Id mismatch");

            var optionValue = await db.OptionValues
                .FirstOrDefaultAsync(o => o.ItemId == optionValueDTO.ItemId && o.OptionId == optionValueDTO.OptionId);
            var isNew = optionValue == null;

            if (isNew)
            {
                optionValue = new OptionValue();

                optionValue.ItemId = optionValueDTO.ItemId;
                optionValue.OptionId = optionValueDTO.OptionId;

                db.Entry(optionValue).State = EntityState.Added;
            }
            else
            {
                db.Entry(optionValue).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(optionValue, optionValueDTO);

            await db.SaveChangesAsync();

            return await Get(optionValue.ItemId, optionValue.OptionId);
        }

        [HttpDelete("{itemId:Guid}/{optionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid itemId, Guid optionId)
        {
            var optionValue = await db.OptionValues
                .FirstOrDefaultAsync(o => o.ItemId == itemId && o.OptionId == optionId);

            if (optionValue == null)
                return NotFound();

            db.Entry(optionValue).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
