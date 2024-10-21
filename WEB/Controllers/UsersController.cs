using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using WEB.Models;
using Microsoft.Extensions.Options;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class UsersController : BaseApiController
    {
        private RoleManager<Role> rm;
        private IOptions<IdentityOptions> opts;

        public UsersController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings, RoleManager<Role> rm, IOptions<IdentityOptions> opts)
            : base(dbFactory, um, appSettings) { this.rm = rm; this.opts = opts; }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] UserSearchOptions searchOptions, [FromQuery] string roleName = null)
        {
            IQueryable<User> results = userManager.Users;
            results = results.Include(o => o.Roles);

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Email.Contains(searchOptions.q) || o.FullName.Contains(searchOptions.q) || o.Email.Contains(searchOptions.q));

            if (!string.IsNullOrWhiteSpace(roleName))
            {
                var role = await rm.Roles.SingleOrDefaultAsync(o => o.Name == roleName);
                results = results.Where(o => o.Roles.Any(r => r.RoleId == role.Id));
            }

            if (searchOptions.Disabled.HasValue) results = results.Where(o => o.Disabled == searchOptions.Disabled);

            results = results.OrderBy(o => o.FirstName).ThenBy(o => o.LastName);

            var roles = await db.Roles.ToListAsync();

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren, roles)));
        }

        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var user = await userManager.Users
                .Include(o => o.Roles)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (user == null)
                return NotFound();

            var roles = await db.Roles.ToListAsync();

            return Ok(ModelFactory.Create(user, dbRoles: roles));
        }

        [HttpPost("{id:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid id, [FromBody] UserDTO userDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (userDTO.Id != id) return BadRequest("Id mismatch");

            var password = string.Empty;
            if (await db.Users.AnyAsync(o => o.Email == userDTO.Email && o.Id != userDTO.Id))
                return BadRequest("Email already exists.");

            var isNew = userDTO.Id == Guid.Empty;

            User user;
            if (isNew)
            {
                user = new User();
                password = Utilities.General.GenerateRandomPassword(opts.Value.Password);

            }
            else
            {
                user = await userManager.FindByIdAsync(userDTO.Id.ToString());

                if (user == null)
                    return NotFound();

            }

            ModelFactory.Hydrate(user, userDTO);

            var saveResult = (isNew ? await userManager.CreateAsync(user, password) : await userManager.UpdateAsync(user));

            if (!saveResult.Succeeded)
                return GetErrorResult(saveResult);

            if (!isNew)
            {
                foreach (var role in await userManager.GetRolesAsync(user))
                {
                    await userManager.RemoveFromRoleAsync(user, role);
                }
            }

            if (userDTO.Roles != null)
            {
                foreach (var roleName in userDTO.Roles)
                {
                    await userManager.AddToRoleAsync(user, roleName);
                }
            }

            if (isNew) await Utilities.General.SendWelcomeMailAsync(user, password, AppSettings);

            return await Get(user.Id);
        }

        [HttpDelete("{id:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await userManager.Users
                .FirstOrDefaultAsync(o => o.Id == id);

            if (user == null)
                return NotFound();

            foreach (var role in await userManager.GetRolesAsync(user))
                await userManager.RemoveFromRoleAsync(user, role);

            await userManager.DeleteAsync(user);

            return Ok();
        }

    }
}
