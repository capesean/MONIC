using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using WEB.Models;
using Microsoft.AspNetCore.Authorization;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class AppController : BaseApiController
    {
        public AppController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings)
            : base(db, um, appSettings) { }

        [HttpGet, Route("settings")]
        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public IActionResult Get()
        {
            var dbSettings = AppSettings.GetDbSettings(db);

            // return the settings for all logged in users
            return Ok(
                new
                {
                }
            );
        }
    }
}
