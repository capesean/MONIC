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
    public class FolderContentsController : BaseApiController
    {
        public FolderContentsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] FolderContentSearchOptions searchOptions)
        {
            IQueryable<FolderContent> results = db.FolderContents;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.AddedBy);
                results = results.Include(o => o.Folder);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Html.Contains(searchOptions.q));

            if (searchOptions.FolderId.HasValue) results = results.Where(o => o.FolderId == searchOptions.FolderId);
            if (searchOptions.AddedById.HasValue) results = results.Where(o => o.AddedById == searchOptions.AddedById);

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{folderContentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid folderContentId)
        {
            var folderContent = await db.FolderContents
                .Include(o => o.Folder)
                .Include(o => o.AddedBy)
                .FirstOrDefaultAsync(o => o.FolderContentId == folderContentId);

            if (folderContent == null)
                return NotFound();

            return Ok(ModelFactory.Create(folderContent));
        }

        [HttpPost("{folderContentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid folderContentId, [FromBody] FolderContentDTO folderContentDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (folderContentDTO.FolderContentId != folderContentId) return BadRequest("Id mismatch");

            if (await db.FolderContents.AnyAsync(o => o.FolderId == folderContentDTO.FolderId && o.Name == folderContentDTO.Name && o.FolderContentId != folderContentDTO.FolderContentId))
                return BadRequest("Name already exists on this Folder.");

            var isNew = folderContentDTO.FolderContentId == Guid.Empty;

            FolderContent folderContent;
            if (isNew)
            {
                folderContent = new FolderContent();

                folderContent.AddedOn = DateTime.UtcNow;
                folderContent.AddedById = CurrentUser.Id;

                db.Entry(folderContent).State = EntityState.Added;
            }
            else
            {
                folderContent = await db.FolderContents
                    .FirstOrDefaultAsync(o => o.FolderContentId == folderContentDTO.FolderContentId);

                if (folderContent == null)
                    return NotFound();

                db.Entry(folderContent).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(folderContent, folderContentDTO);

            await db.SaveChangesAsync();

            return await Get(folderContent.FolderContentId);
        }

        [HttpDelete("{folderContentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid folderContentId)
        {
            var folderContent = await db.FolderContents
                .FirstOrDefaultAsync(o => o.FolderContentId == folderContentId);

            if (folderContent == null)
                return NotFound();

            db.Entry(folderContent).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
