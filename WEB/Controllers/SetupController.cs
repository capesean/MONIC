using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WEB.Controllers;
using WEB.Models;
using WEB.Error;
using WEB.Models.DTOs;

namespace AuthorizationServer.Controllers
{
    [Route("api/[Controller]")]
    public class SetupController : BaseApiController
    {
        private readonly RoleManager<Role> roleManager;

        public SetupController(
            ApplicationDbContext _db,
            UserManager<User> _um,
            RoleManager<Role> _rm,
            AppSettings _appSettings
            )
            : base(_db, _um, _appSettings)
        {
            roleManager = _rm;
        }

        [HttpGet, AllowAnonymous]
        public async Task<IActionResult> CheckSetup()
        {
            return Ok(new { runSetup = !await db.Users.AnyAsync() });
        }

        [HttpPost, AllowAnonymous]
        public async Task<IActionResult> RunSetup(SetupDTO setupDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await db.Users.AnyAsync()) throw new HandledException("The database already has a user account.");

            var user = new User();
            user.FirstName = setupDTO.FirstName;
            user.LastName = setupDTO.LastName;
            user.Email = setupDTO.Email;
            user.UserName = setupDTO.Email;
            user.Disabled = false;

            var saveResult = await userManager.CreateAsync(user, setupDTO.Password);

            if (!saveResult.Succeeded)
                return GetErrorResult(saveResult);

            var appRoles = await roleManager.Roles.ToListAsync();

            foreach (var roleName in appRoles)
                await userManager.AddToRoleAsync(user, roleName.Name);

            return Ok();
        }


    }
}