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
    public partial class UsersController : BaseApiController
    {
        [HttpPost("{id:Guid}/indicatorpermissions"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> AddIndicatorPermissions([FromRoute] Guid id, [FromBody] IEnumerable<IndicatorPermissionDTO> indicatorPermissionDTOs)
        {
            var user = await db.Users
                .Include(o => o.IndicatorPermissions)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (user == null) return NotFound();

            var existingPermissions = user.IndicatorPermissions.ToDictionary(o => o.IndicatorId ?? Guid.Empty);

            foreach (var indicatorPermissionDTO in indicatorPermissionDTOs)
            {
                var indicatorId = indicatorPermissionDTO.IndicatorId ?? Guid.Empty;

                if (indicatorPermissionDTO.UserId != id) return BadRequest("User Ids to not match");

                if (existingPermissions.ContainsKey(indicatorId))
                {
                    ModelFactory.Hydrate(existingPermissions[indicatorId], indicatorPermissionDTO);
                    db.Entry(existingPermissions[indicatorId]).State = EntityState.Modified;
                }
                else
                {
                    var indicatorPermission = new IndicatorPermission();
                    ModelFactory.Hydrate(indicatorPermission, indicatorPermissionDTO);
                    db.Entry(indicatorPermission).State = EntityState.Added;
                }
            }

            await db.SaveChangesAsync();

            return Ok();
        }
    }
}
