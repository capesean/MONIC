using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WEB;
using WEB.Controllers;
using WEB.Models;

namespace AuthorizationServer.Controllers
{
    [Route("api/[Controller]")]
    public class ProfileController : BaseApiController
    {
        public ProfileController(
            ApplicationDbContext _db,
            UserManager<User> _um,
            Settings _settings
            )
            : base(_db, _um, _settings)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Profile()
        {
            // add properties to profile as needed
            var roleIds = CurrentUser.Roles.Select(o => o.RoleId).ToArray();

            var roleNames = await db.Roles
                .Where(o => roleIds.Contains(o.Id))
                .Select(o => o.Name)
                .ToListAsync();

            var profile = new ProfileModel
            {
                Email = CurrentUser.Email,
                FirstName = CurrentUser.FirstName,
                LastName = CurrentUser.LastName,
                FullName = CurrentUser.FullName,
                UserId = CurrentUser.Id,
                Roles = roleNames,
                UserName = CurrentUser.UserName
            };

            return Ok(profile);
        }

    }
}