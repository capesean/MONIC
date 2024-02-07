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
    public class FolderController : BaseApiController
    {
        public FolderController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet("view"), AuthorizeRoles(Roles.Folders)]
        public async Task<IActionResult> View([FromQuery] Guid? folderId)
        {
            Folder folder = null;
            var documents = new List<Document>();
            var folderContents = new List<FolderContent>();

            var subfolders = await db.Folders
                .Where(o => (folderId.HasValue && o.ParentFolderId == folderId.Value) || (!folderId.HasValue && o.RootFolder))
                .OrderBy(o => o.Name)
                .ToListAsync();

            if (folderId.HasValue)
            {
                folder = db.Folders
                    .FirstOrDefault(o => o.FolderId == folderId.Value);

                documents = await db.Documents.Where(o => o.ItemId == folderId.Value)
                    .OrderBy(o => o.FileName)
                    .Include(o => o.UploadedBy)
                    .ToListAsync();

                folderContents = await db.FolderContents.Where(o => o.FolderId == folderId.Value)
                    .OrderBy(o => o.Name)
                    .Include(o => o.AddedBy)
                    .ToListAsync();
            }

            return Ok(
                new
                {
                    folder = ModelFactory.Create(folder),
                    subfolders = subfolders.Select(o => ModelFactory.Create(o)),
                    documents = documents.Select(o => ModelFactory.Create(o)),
                    folderContents = folderContents.Select(o => ModelFactory.Create(o))
                });
        }

        [HttpGet("foldercontent/{folderContentId:Guid}"), AuthorizeRoles(Roles.Folders)]
        public async Task<IActionResult> GetFolderContent([FromRoute] Guid folderContentId)
        {
            var folderContent = await db.FolderContents
                .Include(o => o.Folder)
                .Include(o => o.AddedBy)
                .FirstOrDefaultAsync(o => o.FolderContentId == folderContentId);

            if (folderContent == null)
                return NotFound();

            return Ok(ModelFactory.Create(folderContent));
        }
    }
}
