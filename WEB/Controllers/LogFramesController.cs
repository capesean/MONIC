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
    public class LogFramesController : BaseApiController
    {
        public LogFramesController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] LogFrameSearchOptions searchOptions)
        {
            IQueryable<LogFrame> results = db.LogFrames;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.LogFrameRows);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{logFrameId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid logFrameId)
        {
            var logFrame = await db.LogFrames
                .FirstOrDefaultAsync(o => o.LogFrameId == logFrameId);

            if (logFrame == null)
                return NotFound();

            return Ok(ModelFactory.Create(logFrame));
        }

        [HttpPost("{logFrameId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid logFrameId, [FromBody] LogFrameDTO logFrameDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (logFrameDTO.LogFrameId != logFrameId) return BadRequest("Id mismatch");

            if (await db.LogFrames.AnyAsync(o => o.Name == logFrameDTO.Name && o.LogFrameId != logFrameDTO.LogFrameId))
                return BadRequest("Name already exists.");

            var isNew = logFrameDTO.LogFrameId == Guid.Empty;

            LogFrame logFrame;
            if (isNew)
            {
                logFrame = new LogFrame();

                db.Entry(logFrame).State = EntityState.Added;
            }
            else
            {
                logFrame = await db.LogFrames
                    .FirstOrDefaultAsync(o => o.LogFrameId == logFrameDTO.LogFrameId);

                if (logFrame == null)
                    return NotFound();

                db.Entry(logFrame).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(logFrame, logFrameDTO);

            await db.SaveChangesAsync();

            return await Get(logFrame.LogFrameId);
        }

        [HttpDelete("{logFrameId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid logFrameId)
        {
            var logFrame = await db.LogFrames
                .FirstOrDefaultAsync(o => o.LogFrameId == logFrameId);

            if (logFrame == null)
                return NotFound();

            if (await db.LogFrameRows.AnyAsync(o => o.LogFrameId == logFrame.LogFrameId))
                return BadRequest("Unable to delete the logical framework as it has related logframe rows");

            db.Entry(logFrame).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{logFrameId:Guid}/logframerows"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteLogFrameRows(Guid logFrameId)
        {
            foreach (var logFrameRow in db.LogFrameRows.Where(o => o.LogFrameId == logFrameId).ToList())
                db.Entry(logFrameRow).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
