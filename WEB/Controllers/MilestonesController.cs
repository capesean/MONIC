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
    public class MilestonesController : BaseApiController
    {
        public MilestonesController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] MilestoneSearchOptions searchOptions)
        {
            IQueryable<Milestone> results = db.Milestones;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Project);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Tasks);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Description.Contains(searchOptions.q));

            if (searchOptions.ProjectId.HasValue) results = results.Where(o => o.ProjectId == searchOptions.ProjectId);

            results = results.OrderBy(o => o.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{milestoneId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid milestoneId)
        {
            var milestone = await db.Milestones
                .Include(o => o.Project)
                .FirstOrDefaultAsync(o => o.MilestoneId == milestoneId);

            if (milestone == null)
                return NotFound();

            return Ok(ModelFactory.Create(milestone));
        }

        [HttpPost("{milestoneId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid milestoneId, [FromBody] MilestoneDTO milestoneDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (milestoneDTO.MilestoneId != milestoneId) return BadRequest("Id mismatch");

            if (await db.Milestones.AnyAsync(o => o.ProjectId == milestoneDTO.ProjectId && o.Name == milestoneDTO.Name && o.MilestoneId != milestoneDTO.MilestoneId))
                return BadRequest("Name already exists on this Project.");

            var isNew = milestoneDTO.MilestoneId == Guid.Empty;

            Milestone milestone;
            if (isNew)
            {
                milestone = new Milestone();

                milestoneDTO.SortOrder = (await db.Milestones.Where(o => o.ProjectId == milestoneDTO.ProjectId).MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(milestone).State = EntityState.Added;
            }
            else
            {
                milestone = await db.Milestones
                    .FirstOrDefaultAsync(o => o.MilestoneId == milestoneDTO.MilestoneId);

                if (milestone == null)
                    return NotFound();

                db.Entry(milestone).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(milestone, milestoneDTO);

            await db.SaveChangesAsync();

            return await Get(milestone.MilestoneId);
        }

        [HttpDelete("{milestoneId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid milestoneId)
        {
            var milestone = await db.Milestones
                .FirstOrDefaultAsync(o => o.MilestoneId == milestoneId);

            if (milestone == null)
                return NotFound();

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.Tasks.Where(o => o.MilestoneId == milestone.MilestoneId).ExecuteDeleteAsync();

                db.Entry(milestone).State = EntityState.Deleted;

                await db.SaveChangesAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromQuery] Guid projectId, [FromBody] Guid[] sortedIds)
        {
            var milestones = await db.Milestones
                .Where(o => o.ProjectId == projectId)
                .ToListAsync();
            if (milestones.Count != sortedIds.Length) return BadRequest("Some of the milestones could not be found");

            foreach (var milestone in milestones)
            {
                db.Entry(milestone).State = EntityState.Modified;
                milestone.SortOrder = Array.IndexOf(sortedIds, milestone.MilestoneId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{milestoneId:Guid}/tasks"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteTasks(Guid milestoneId)
        {
            await db.Tasks.Where(o => o.MilestoneId == milestoneId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
