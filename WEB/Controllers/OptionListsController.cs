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
    public class OptionListsController : BaseApiController
    {
        public OptionListsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] OptionListSearchOptions searchOptions)
        {
            IQueryable<OptionList> results = db.OptionLists;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Fields);
                results = results.Include(o => o.Options);
                results = results.Include(o => o.Indicators);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{optionListId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid optionListId)
        {
            var optionList = await db.OptionLists
                .FirstOrDefaultAsync(o => o.OptionListId == optionListId);

            if (optionList == null)
                return NotFound();

            return Ok(ModelFactory.Create(optionList));
        }

        [HttpPost("{optionListId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid optionListId, [FromBody] OptionListDTO optionListDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (optionListDTO.OptionListId != optionListId) return BadRequest("Id mismatch");

            if (await db.OptionLists.AnyAsync(o => o.Name == optionListDTO.Name && o.OptionListId != optionListDTO.OptionListId))
                return BadRequest("Name already exists.");

            var isNew = optionListDTO.OptionListId == Guid.Empty;

            OptionList optionList;
            if (isNew)
            {
                optionList = new OptionList();

                db.Entry(optionList).State = EntityState.Added;
            }
            else
            {
                optionList = await db.OptionLists
                    .FirstOrDefaultAsync(o => o.OptionListId == optionListDTO.OptionListId);

                if (optionList == null)
                    return NotFound();

                db.Entry(optionList).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(optionList, optionListDTO);

            await db.SaveChangesAsync();

            return await Get(optionList.OptionListId);
        }

        [HttpDelete("{optionListId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid optionListId)
        {
            var optionList = await db.OptionLists
                .FirstOrDefaultAsync(o => o.OptionListId == optionListId);

            if (optionList == null)
                return NotFound();

            if (await db.Options.AnyAsync(o => o.OptionListId == optionList.OptionListId))
                return BadRequest("Unable to delete the option list as it has related options");

            if (await db.Fields.AnyAsync(o => o.OptionListId == optionList.OptionListId))
                return BadRequest("Unable to delete the option list as it has related fields");

            if (await db.Indicators.AnyAsync(o => o.OptionListId == optionList.OptionListId))
                return BadRequest("Unable to delete the option list as it has related indicators");

            db.Entry(optionList).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
