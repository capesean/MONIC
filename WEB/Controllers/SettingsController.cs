using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using WEB.Models;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class SettingsController : BaseApiController
    {
        public SettingsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get()
        {
            var settings = await db.Settings
                .SingleAsync(o => o.Id == Guid.Empty);

            if (settings == null)
                return NotFound();

            return Ok(ModelFactory.Create(settings));
        }

        [HttpPost, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save([FromBody] SettingsDTO settingsDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var settings = await db.Settings
                .SingleAsync(o => o.Id == Guid.Empty);

            ModelFactory.Hydrate(settings, settingsDTO);
            db.Entry(settings).State = EntityState.Modified;

            await db.SaveChangesAsync();

            return await Get();
        }

    }
}
