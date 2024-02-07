using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WEB.Models;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), AuthorizeRoles(Roles.Administrator)]
    public class ToolsController : BaseApiController
    {
        public ToolsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpPost("geojson/{entityTypeId:Guid}")]
        public async Task<IActionResult> UploadGeoJSON(Guid entityTypeId, [FromBody] FileContentsDTO fileContentsDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entityType = await db.EntityTypes.FirstOrDefaultAsync(o => o.EntityTypeId == entityTypeId);
            if (entityType == null) return NotFound();

            var bytes = Convert.FromBase64String(fileContentsDTO.FileContents);

            System.IO.File.WriteAllBytes(Path.Join(AppSettings.WebRootPath, $"assets/geojson/{entityTypeId.ToString().ToLowerInvariant()}.json"), bytes);

            return Ok();
        }
    }

}
