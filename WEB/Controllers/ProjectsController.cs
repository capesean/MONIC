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
    public class ProjectsController : BaseApiController
    {
        public ProjectsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] ProjectSearchOptions searchOptions)
        {
            IQueryable<Project> results = db.Projects;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Milestones);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            results = results.OrderBy(o => o.ProjectId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{projectId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid projectId)
        {
            var project = await db.Projects
                .FirstOrDefaultAsync(o => o.ProjectId == projectId);

            if (project == null)
                return NotFound();

            return Ok(ModelFactory.Create(project));
        }

        [HttpPost("{projectId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid projectId, [FromBody] ProjectDTO projectDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (projectDTO.ProjectId != projectId) return BadRequest("Id mismatch");

            if (await db.Projects.AnyAsync(o => o.Name == projectDTO.Name && o.ProjectId != projectDTO.ProjectId))
                return BadRequest("Name already exists.");

            var isNew = projectDTO.ProjectId == Guid.Empty;

            Project project;
            if (isNew)
            {
                project = new Project();

                db.Entry(project).State = EntityState.Added;
            }
            else
            {
                project = await db.Projects
                    .FirstOrDefaultAsync(o => o.ProjectId == projectDTO.ProjectId);

                if (project == null)
                    return NotFound();

                db.Entry(project).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(project, projectDTO);

            await db.SaveChangesAsync();

            return await Get(project.ProjectId);
        }

        [HttpDelete("{projectId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid projectId)
        {
            var project = await db.Projects
                .FirstOrDefaultAsync(o => o.ProjectId == projectId);

            if (project == null)
                return NotFound();

            foreach (var task in db.Tasks.Where(o => o.Milestone.ProjectId == project.ProjectId))
                db.Entry(task).State = EntityState.Deleted;

            foreach (var milestone in db.Milestones.Where(o => o.ProjectId == project.ProjectId))
                db.Entry(milestone).State = EntityState.Deleted;

            db.Entry(project).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{projectId:Guid}/milestones"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteMilestones(Guid projectId)
        {
            foreach (var milestone in db.Milestones.Where(o => o.ProjectId == projectId).ToList())
                db.Entry(milestone).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
