using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using WEB.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class AppController : BaseApiController
    {
        public AppController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings)
            : base(dbFactory, um, appSettings) { }

        [HttpGet, Route("settings")]
        public IActionResult Get()
        {
            var dbSettings = AppSettings.GetDbSettings(db);

            // return the settings for all logged in users
            return Ok(
                new
                {
                    dbSettings.SetupCompleted
                }
            );
        }

        // needs to be run on login page (anonymous)
        [HttpGet, Route("setupcheck"), AllowAnonymous]
        public IActionResult SetupCheck()
        {
            var dbSettings = AppSettings.GetDbSettings(db);

            return Ok(
                new
                {
                    dbSettings.SetupCompleted
                }
            );
        }

    }
}
