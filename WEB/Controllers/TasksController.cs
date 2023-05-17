using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using WEB.Models;
using Task = WEB.Models.Task;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class TasksController : BaseApiController
    {
        public TasksController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] TaskSearchOptions searchOptions)
        {
            IQueryable<Task> results = db.Tasks;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Milestone.Project);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Description.Contains(searchOptions.q));

            if (searchOptions.MilestoneId.HasValue) results = results.Where(o => o.MilestoneId == searchOptions.MilestoneId);
            if (searchOptions.ProjectId.HasValue) results = results.Where(o => o.Milestone.ProjectId == searchOptions.ProjectId);

            results = results.OrderBy(o => o.StartDate);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{taskId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid taskId)
        {
            var task = await db.Tasks
                .Include(o => o.Milestone.Project)
                .FirstOrDefaultAsync(o => o.TaskId == taskId);

            if (task == null)
                return NotFound();

            return Ok(ModelFactory.Create(task));
        }

        [HttpPost("{taskId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid taskId, [FromBody] TaskDTO taskDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (taskDTO.TaskId != taskId) return BadRequest("Id mismatch");

            if (await db.Tasks.AnyAsync(o => o.MilestoneId == taskDTO.MilestoneId && o.Name == taskDTO.Name && o.TaskId != taskDTO.TaskId))
                return BadRequest("Name already exists on this Milestone.");

            var isNew = taskDTO.TaskId == Guid.Empty;

            Task task;
            if (isNew)
            {
                task = new Task();

                db.Entry(task).State = EntityState.Added;
            }
            else
            {
                task = await db.Tasks
                    .FirstOrDefaultAsync(o => o.TaskId == taskDTO.TaskId);

                if (task == null)
                    return NotFound();

                db.Entry(task).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(task, taskDTO);

            await db.SaveChangesAsync();

            return await Get(task.TaskId);
        }

        [HttpDelete("{taskId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid taskId)
        {
            var task = await db.Tasks
                .FirstOrDefaultAsync(o => o.TaskId == taskId);

            if (task == null)
                return NotFound();

            db.Entry(task).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
