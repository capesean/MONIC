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
    public class OptionsController : BaseApiController
    {
        public OptionsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] OptionSearchOptions searchOptions)
        {
            IQueryable<Option> results = db.Options;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.OptionList);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.ItemOptions);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            if (searchOptions.OptionListId.HasValue) results = results.Where(o => o.OptionListId == searchOptions.OptionListId);

            results = results.OrderBy(o => o.OptionList.Name).ThenBy(o => o.SortOrder).ThenBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{optionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid optionId)
        {
            var option = await db.Options
                .Include(o => o.OptionList)
                .FirstOrDefaultAsync(o => o.OptionId == optionId);

            if (option == null)
                return NotFound();

            return Ok(ModelFactory.Create(option));
        }

        [HttpPost("{optionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid optionId, [FromBody] OptionDTO optionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (optionDTO.OptionId != optionId) return BadRequest("Id mismatch");

            if (await db.Options.AnyAsync(o => o.OptionListId == optionDTO.OptionListId && o.Name == optionDTO.Name && o.OptionId != optionDTO.OptionId))
                return BadRequest("Name already exists on this Option List.");

            if (optionDTO.Value.HasValue && await db.Options.AnyAsync(o => o.OptionListId == optionDTO.OptionListId && o.Value == optionDTO.Value && o.OptionId != optionDTO.OptionId))
                return BadRequest("Value already exists on this Option List.");

            var isNew = optionDTO.OptionId == Guid.Empty;

            Option option;
            if (isNew)
            {
                option = new Option();

                optionDTO.SortOrder = (await db.Options.Where(o => o.OptionListId == optionDTO.OptionListId).MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(option).State = EntityState.Added;
            }
            else
            {
                option = await db.Options
                    .FirstOrDefaultAsync(o => o.OptionId == optionDTO.OptionId);

                if (option == null)
                    return NotFound();

                db.Entry(option).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(option, optionDTO);

            await db.SaveChangesAsync();

            return await Get(option.OptionId);
        }

        [HttpDelete("{optionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid optionId)
        {
            var option = await db.Options
                .FirstOrDefaultAsync(o => o.OptionId == optionId);

            if (option == null)
                return NotFound();

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.ItemOptions.Where(o => o.OptionId == option.OptionId).ExecuteDeleteAsync();

                db.Entry(option).State = EntityState.Deleted;

                await db.SaveChangesAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromQuery] Guid optionListId, [FromBody] Guid[] sortedIds)
        {
            var options = await db.Options
                .Where(o => o.OptionListId == optionListId)
                .ToListAsync();
            if (options.Count != sortedIds.Length) return BadRequest("Some of the options could not be found");

            foreach (var option in options)
            {
                db.Entry(option).State = EntityState.Modified;
                option.SortOrder = Array.IndexOf(sortedIds, option.OptionId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
