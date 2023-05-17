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
    public class GroupsController : BaseApiController
    {
        public GroupsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] GroupSearchOptions searchOptions)
        {
            IQueryable<Group> results = db.Groups;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Fields);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            results = results.OrderBy(o => o.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{groupId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid groupId)
        {
            var group = await db.Groups
                .FirstOrDefaultAsync(o => o.GroupId == groupId);

            if (group == null)
                return NotFound();

            return Ok(ModelFactory.Create(group));
        }

        [HttpPost("{groupId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid groupId, [FromBody] GroupDTO groupDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (groupDTO.GroupId != groupId) return BadRequest("Id mismatch");

            if (await db.Groups.AnyAsync(o => o.Name == groupDTO.Name && o.GroupId != groupDTO.GroupId))
                return BadRequest("Name already exists.");

            var isNew = groupDTO.GroupId == Guid.Empty;

            Group group;
            if (isNew)
            {
                group = new Group();

                groupDTO.SortOrder = (await db.Groups.MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(group).State = EntityState.Added;
            }
            else
            {
                group = await db.Groups
                    .FirstOrDefaultAsync(o => o.GroupId == groupDTO.GroupId);

                if (group == null)
                    return NotFound();

                db.Entry(group).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(group, groupDTO);

            await db.SaveChangesAsync();

            return await Get(group.GroupId);
        }

        [HttpDelete("{groupId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid groupId)
        {
            var group = await db.Groups
                .FirstOrDefaultAsync(o => o.GroupId == groupId);

            if (group == null)
                return NotFound();

            if (await db.Fields.AnyAsync(o => o.GroupId == group.GroupId))
                return BadRequest("Unable to delete the group as it has related fields");

            db.Entry(group).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromBody] Guid[] sortedIds)
        {
            var groups = await db.Groups
                .ToListAsync();
            if (groups.Count != sortedIds.Length) return BadRequest("Some of the groups could not be found");

            foreach (var group in groups)
            {
                db.Entry(group).State = EntityState.Modified;
                group.SortOrder = Array.IndexOf(sortedIds, group.GroupId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{groupId:Guid}/fields"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteFields(Guid groupId)
        {
            foreach (var field in db.Fields.Where(o => o.GroupId == groupId).ToList())
                db.Entry(field).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
