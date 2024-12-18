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
    public partial class UsersController : BaseApiController
    {
        private RoleManager<Role> rm;
        private IOptions<IdentityOptions> opts;

        public UsersController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings, RoleManager<Role> rm, IOptions<IdentityOptions> opts)
            : base(dbFactory, um, appSettings) { this.rm = rm; this.opts = opts; }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] UserSearchOptions searchOptions, [FromQuery] string roleName = null)
        {
            // must be admin, or in the entity you're querying
            if (!CurrentUser.IsInRole(Roles.Administrator) && !searchOptions.OrganisationId.HasValue && searchOptions.OrganisationId != CurrentUser.OrganisationId)
                return Forbid();

            IQueryable<User> results = userManager.Users;
            results = results.Include(o => o.Roles);

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Organisation);
                results = results.Include(o => o.Entity);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.AddedFolderContents);
                results = results.Include(o => o.DataReviews);
                results = results.Include(o => o.EntityPermissions);
                results = results.Include(o => o.UploadedDocuments);
                results = results.Include(o => o.CreatedIndicators);
                results = results.Include(o => o.IndicatorPermissions);
                results = results.Include(o => o.SubmittedResponses);
                results = results.Include(o => o.LastSavedData);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Email.Contains(searchOptions.q) || o.FullName.Contains(searchOptions.q) || o.Email.Contains(searchOptions.q));

            if (!string.IsNullOrWhiteSpace(roleName))
            {
                var role = await rm.Roles.SingleOrDefaultAsync(o => o.Name == roleName);
                results = results.Where(o => o.Roles.Any(r => r.RoleId == role.Id));
            }

            if (searchOptions.Disabled.HasValue) results = results.Where(o => o.Disabled == searchOptions.Disabled);
            if (searchOptions.AffiliatedEntityId.HasValue) results = results.Where(o => o.AffiliatedEntityId == searchOptions.AffiliatedEntityId);
            if (searchOptions.OrganisationId.HasValue) results = results.Where(o => o.OrganisationId == searchOptions.OrganisationId);

            results = results.OrderBy(o => o.FirstName).ThenBy(o => o.LastName);

            var roles = await db.Roles.ToListAsync();

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren, roles)));
        }

        [HttpGet("{id:Guid}"), AuthorizeRoles(Roles.Administrator, Roles.Manager)]
        public async Task<IActionResult> Get(Guid id)
        {
            var user = await userManager.Users
                .Include(o => o.Roles)
                .Include(o => o.Organisation)
                .Include(o => o.Entity)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (user == null)
                return NotFound();

            // admins can access everyone; otherwise just your own org for org manager (AuthorizeRoles attribute)
            if (!CurrentUser.IsInRole(Roles.Administrator) && !(CurrentUser.IsInRole(Roles.Manager) && user.OrganisationId == CurrentUser.OrganisationId))
                return Forbid();

            var roles = await db.Roles.ToListAsync();

            return Ok(ModelFactory.Create(user, dbRoles: roles));
        }

        [HttpPost("{id:Guid}"), AuthorizeRoles(Roles.Administrator, Roles.Manager)]
        public async Task<IActionResult> Save(Guid id, [FromBody] UserDTO userDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (userDTO.Id != id) return BadRequest("Id mismatch");

            if (!CurrentUser.IsInRole(Roles.Administrator) && userDTO.OrganisationId != CurrentUser.OrganisationId)
                return BadRequest("You are not allowed to save a user in that organisation");

            var password = string.Empty;
            if (await db.Users.AnyAsync(o => o.Email == userDTO.Email && o.Id != userDTO.Id))
                return BadRequest("Email already exists.");

            if (userDTO.Roles != null)
            {
                if (userDTO.Roles.Contains(Roles.Oversight.ToString()) && userDTO.Roles.Contains(Roles.Manager.ToString()))
                    return BadRequest("User may not be in both Oversight and Manager roles.");

                if (userDTO.Roles.Contains(Roles.Oversight.ToString()))
                {
                    if (userDTO.AffiliatedEntityId == null) return BadRequest("Oversight users must have an affiliated entity");
                    if (userDTO.OrganisationId != null) return BadRequest("Oversight users may not have an organisation");
                }

                if (userDTO.Roles.Contains(Roles.Manager.ToString()))
                {
                    if (userDTO.OrganisationId == null) return BadRequest("Managers must have an organisation");
                    if (userDTO.AffiliatedEntityId != null) return BadRequest("Managers may not have an organisation");
                }
            }

            if (userDTO.AffiliatedEntityId != null && (userDTO.Roles == null || !userDTO.Roles.Contains(Roles.Oversight.ToString())))
                return BadRequest("Only oversight users can have an affiliated entity");

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

                // check the loaded user is in the manager's organisation
                if (!CurrentUser.IsInRole(Roles.Administrator))
                {
                    if (user.OrganisationId != CurrentUser.OrganisationId)
                        return Forbid();
                    if (user.Roles.Any() && user.Id != CurrentUser.Id)
                        return BadRequest("This user has other system roles: you are not allowed to edit their account");
                }

                // if changing the user organisation, remove invalid entity permissions
                if (userDTO.OrganisationId != user.OrganisationId)
                    foreach (var entityPermission in await db.EntityPermissions.Where(o => o.UserId == user.Id && o.Entity.OrganisationId == userDTO.OrganisationId).ToListAsync())
                        db.Entry(entityPermission).State = EntityState.Deleted;


            }

            var organisationChanged = user.OrganisationId != userDTO.OrganisationId;
            var affiliatedEntityChanged = user.AffiliatedEntityId != userDTO.AffiliatedEntityId;

            ModelFactory.Hydrate(user, userDTO);

            var saveResult = (isNew ? await userManager.CreateAsync(user, password) : await userManager.UpdateAsync(user));

            if (!saveResult.Succeeded)
                return GetErrorResult(saveResult);

            var currentUserIsAdmin = CurrentUser.IsInRole(Roles.Administrator);
            if (!isNew && currentUserIsAdmin)
            {
                foreach (var role in await userManager.GetRolesAsync(user))
                {
                    await userManager.RemoveFromRoleAsync(user, role);
                }
            }

            if (userDTO.Roles != null && currentUserIsAdmin)
            {
                foreach (var roleName in userDTO.Roles)
                {
                    await userManager.AddToRoleAsync(user, roleName);
                }
            }

            // simple permissions mode
            var dbSettings = AppSettings.GetDbSettings(db);
            if (dbSettings.SimplePermissionsMode)
            {
                // new user -> add global indicator permission
                if (isNew)
                {
                    var indicatorPermission = new IndicatorPermission();
                    indicatorPermission.UserId = user.Id;
                    indicatorPermission.Edit = !userDTO.Roles.Any(o => o == Roles.Oversight.ToString());
                    indicatorPermission.Submit = dbSettings.UseSubmit;
                    indicatorPermission.Approve = dbSettings.UseApprove;
                    db.Entry(indicatorPermission).State = EntityState.Added;
                }

                if (!isNew && (organisationChanged || affiliatedEntityChanged))
                {
                    foreach (var entityPermission in await db.EntityPermissions.Where(o => o.UserId == id).ToListAsync())
                        db.Entry(entityPermission).State = EntityState.Deleted;
                }

                // organisation is changing or new user -> correct/remove/set entity permissions
                if (organisationChanged || isNew)
                {
                    if (userDTO.OrganisationId.HasValue)
                    {
                        // add entity permissions, all set to true
                        foreach (var entity in await db.Entities.Where(o => o.OrganisationId == userDTO.OrganisationId).ToListAsync())
                        {
                            var entityPermission = new EntityPermission();
                            entityPermission.UserId = user.Id;
                            entityPermission.EntityId = entity.EntityId;
                            db.Entry(entityPermission).State = EntityState.Added;
                        }
                    }
                }

                // affiliated entity is changing or new user -> correct/remove/set entity permissions
                if (affiliatedEntityChanged || isNew)
                {
                    if (userDTO.AffiliatedEntityId.HasValue)
                    {
                        // add entity permissions for affiliated entity + children
                        foreach (var entity in await db.Entities.Where(o => o.EntityId == userDTO.AffiliatedEntityId || o.ParentEntities.Any(el => el.ParentEntityId == userDTO.AffiliatedEntityId)).ToListAsync())
                        {
                            var entityPermission = new EntityPermission();
                            entityPermission.UserId = user.Id;
                            entityPermission.EntityId = entity.EntityId;
                            db.Entry(entityPermission).State = EntityState.Added;
                        }
                    }
                }

                // new user, created by manager, so add manager role
                if (isNew && !currentUserIsAdmin)
                {
                    await userManager.AddToRoleAsync(user, Roles.Manager.ToString());
                }

                await db.SaveChangesAsync();
            }


            if (isNew) await Utilities.General.SendWelcomeMailAsync(user, password, AppSettings);

            return await Get(user.Id);
        }

        [HttpDelete("{id:Guid}"), AuthorizeRoles(Roles.Administrator, Roles.Manager)]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (id == CurrentUser.Id) return BadRequest("You are not allowed to delete your own account");

            var user = await userManager.Users
                .FirstOrDefaultAsync(o => o.Id == id);

            if (user == null)
                return NotFound();

            if (!CurrentUser.IsInRole(Roles.Administrator))
            {
                if (user.OrganisationId != CurrentUser.OrganisationId)
                    return Forbid();
            }

            if (await db.Data.AnyAsync(o => o.LastSavedById == user.Id))
                return BadRequest("Unable to delete the user as it has related last saved data");

            if (await db.Indicators.AnyAsync(o => o.CreatedById == user.Id))
                return BadRequest("Unable to delete the user as it has related created indicators");

            if (await db.DataReviews.AnyAsync(o => o.UserId == user.Id))
                return BadRequest("Unable to delete the user as it has related data reviews");

            if (await db.Responses.AnyAsync(o => o.SubmittedById == user.Id))
                return BadRequest("Unable to delete the user as it has related submitted responses");

            if (await db.Documents.AnyAsync(o => o.UploadedById == user.Id))
                return BadRequest("Unable to delete the user as it has related uploaded documents");

            if (await db.FolderContents.AnyAsync(o => o.AddedById == user.Id))
                return BadRequest("Unable to delete the user as it has related added folder content");

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                await db.EntityPermissions.Where(o => o.UserId == user.Id).ExecuteDeleteAsync();

                await db.IndicatorPermissions.Where(o => o.UserId == user.Id).ExecuteDeleteAsync();

                foreach (var role in await userManager.GetRolesAsync(user))
                    await userManager.RemoveFromRoleAsync(user, role);

                await userManager.DeleteAsync(user);

                transactionScope.Complete();
            }

            return Ok();
        }

        [HttpPost("{id:Guid}/entitypermissions")]
        public async Task<IActionResult> SaveEntityPermissions(Guid id, [FromBody] Guid[] entityIds)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entityPermissions = await db.EntityPermissions
                .Where(o => o.UserId == id)
                .ToListAsync();

            if (CurrentUser.IsInRole(Roles.Administrator)) { }
            else if (CurrentUser.IsInRole(Roles.Manager))
            {
                if ((await db.Users.FirstAsync(o => o.Id == id)).OrganisationId != CurrentUser.OrganisationId) return Forbid();
                if (await db.Entities.AnyAsync(o => entityIds.Contains(o.EntityId) && o.OrganisationId != CurrentUser.OrganisationId)) return Forbid();
            }
            else return Forbid();

            foreach (var entityId in entityIds)
            {
                if (!entityPermissions.Any(o => o.EntityId == entityId))
                {
                    var entityPermission = new EntityPermission { UserId = id, EntityId = entityId };
                    db.Entry(entityPermission).State = EntityState.Added;
                }
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id:Guid}/entitypermissions"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteEntityPermissions(Guid id)
        {
            await db.EntityPermissions.Where(o => o.UserId == id).ExecuteDeleteAsync();

            return Ok();
        }

        [HttpDelete("{id:Guid}/indicatorpermissions"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteIndicatorPermissions(Guid id)
        {
            await db.IndicatorPermissions.Where(o => o.UserId == id).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
