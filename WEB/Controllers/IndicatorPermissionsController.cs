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
    public partial class IndicatorPermissionsController : BaseApiController
    {
        public IndicatorPermissionsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator, Roles.Manager)]
        public async Task<IActionResult> Search([FromQuery] IndicatorPermissionSearchOptions searchOptions)
        {
            IQueryable<IndicatorPermission> results = db.IndicatorPermissions;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Indicator.Subcategory.Category);
                results = results.Include(o => o.User);
            }

            if (searchOptions.UserId.HasValue) results = results.Where(o => o.UserId == searchOptions.UserId);
            if (searchOptions.IndicatorId.HasValue) results = results.Where(o => o.IndicatorId == searchOptions.IndicatorId);
            if (searchOptions.Verify.HasValue) results = results.Where(o => o.Verify == searchOptions.Verify);

            if (CurrentUser.IsInRole(Roles.Administrator)) { }
            else if (CurrentUser.IsInRole(Roles.Manager)) { results = results.Where(o => o.User.OrganisationId == CurrentUser.OrganisationId); }
            else return Forbid();

            results = results.OrderBy(o => o.IndicatorId.HasValue ? 1 : 0)
                .ThenBy(o => o.Indicator.Subcategory.Category.SortOrder)
                .ThenBy(o => o.Indicator.Subcategory.SortOrder)
                .ThenBy(o => o.Indicator.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{indicatorPermissionId:Guid}"), AuthorizeRoles(Roles.Administrator, Roles.Manager)]
        public async Task<IActionResult> Get(Guid indicatorPermissionId)
        {
            var indicatorPermission = await db.IndicatorPermissions
                .Include(o => o.User)
                .Include(o => o.Indicator)
                .FirstOrDefaultAsync(o => o.IndicatorPermissionId == indicatorPermissionId);

            if (indicatorPermission == null)
                return NotFound();

            if (!CurrentUser.IsInRole(Roles.Administrator) && !(CurrentUser.IsInRole(Roles.Manager) && (await db.Users.FirstAsync(o => o.Id == indicatorPermission.UserId)).OrganisationId == CurrentUser.OrganisationId))
                return Forbid();

            return Ok(ModelFactory.Create(indicatorPermission));
        }

        [HttpPost("{indicatorPermissionId:Guid}"), AuthorizeRoles(Roles.Administrator, Roles.Manager)]
        public async Task<IActionResult> Save(Guid indicatorPermissionId, [FromBody] IndicatorPermissionDTO indicatorPermissionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (indicatorPermissionDTO.IndicatorPermissionId != indicatorPermissionId) return BadRequest("Id mismatch");

            // required for default permission when manager creates a new user
            if (!CurrentUser.IsInRole(Roles.Administrator) && !(CurrentUser.IsInRole(Roles.Manager) && (await db.Users.FirstOrDefaultAsync(o => o.Id == indicatorPermissionDTO.UserId)).OrganisationId == CurrentUser.OrganisationId))
                return Forbid();

            var isNew = indicatorPermissionDTO.IndicatorPermissionId == Guid.Empty;

            IndicatorPermission indicatorPermission;
            if (isNew)
            {
                indicatorPermission = new IndicatorPermission();

                db.Entry(indicatorPermission).State = EntityState.Added;
            }
            else
            {
                indicatorPermission = await db.IndicatorPermissions
                    .FirstOrDefaultAsync(o => o.IndicatorPermissionId == indicatorPermissionDTO.IndicatorPermissionId);

                if (indicatorPermission == null)
                    return NotFound();

                db.Entry(indicatorPermission).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(indicatorPermission, indicatorPermissionDTO);

            await db.SaveChangesAsync();

            return await Get(indicatorPermission.IndicatorPermissionId);
        }

        [HttpDelete("{indicatorPermissionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid indicatorPermissionId)
        {
            var indicatorPermission = await db.IndicatorPermissions
                .FirstOrDefaultAsync(o => o.IndicatorPermissionId == indicatorPermissionId);

            if (indicatorPermission == null)
                return NotFound();

            db.Entry(indicatorPermission).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
