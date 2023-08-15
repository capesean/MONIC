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
    public class FoldersController : BaseApiController
    {
        public FoldersController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] FolderSearchOptions searchOptions)
        {
            IQueryable<Folder> results = db.Folders;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.ParentFolder);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Subfolders);
                results = results.Include(o => o.FolderContents);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Description.Contains(searchOptions.q));

            if (searchOptions.ParentFolderId.HasValue) results = results.Where(o => o.ParentFolderId == searchOptions.ParentFolderId);

            results = results.OrderBy(o => o.FolderId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{folderId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid folderId)
        {
            var folder = await db.Folders
                .Include(o => o.ParentFolder)
                .FirstOrDefaultAsync(o => o.FolderId == folderId);

            if (folder == null)
                return NotFound();

            var item = await db.Items
               .Include(o => o.FieldValues)
               .Include(o => o.OptionValues)
               .FirstOrDefaultAsync(o => o.ItemId == folderId);

            var organisationDTO = ModelFactory.Create(folder, true, false, item);

            return Ok(ModelFactory.Create(folder));
        }

        [HttpPost("{folderId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid folderId, [FromBody] FolderDTO folderDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (folderDTO.FolderId != folderId) return BadRequest("Id mismatch");

            var isNew = folderDTO.FolderId == Guid.Empty;

            Folder folder;
            if (isNew)
            {
                folder = new Folder();

                db.Entry(new Item { ItemId = folder.FolderId, ItemType = ItemType.Folder }).State = EntityState.Added;

                db.Entry(folder).State = EntityState.Added;
            }
            else
            {
                folder = await db.Folders
                    .FirstOrDefaultAsync(o => o.FolderId == folderDTO.FolderId);

                if (folder == null)
                    return NotFound();

                db.Entry(folder).State = EntityState.Modified;
            }

            await ItemFunctions.HydrateFieldsAsync(db, folder.FolderId, folderDTO.FieldValues, folderDTO.OptionValues);

            ModelFactory.Hydrate(folder, folderDTO);

            await db.SaveChangesAsync();

            return await Get(folder.FolderId);
        }

        [HttpDelete("{folderId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid folderId)
        {
            var folder = await db.Folders
                .FirstOrDefaultAsync(o => o.FolderId == folderId);

            if (folder == null)
                return NotFound();

            if (await db.Folders.AnyAsync(o => o.ParentFolderId == folder.FolderId))
                return BadRequest("Unable to delete the folder as it has related folders");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.FolderContents.Where(o => o.FolderId == folder.FolderId).ExecuteDeleteAsync();

            ItemFunctions.DeleteDocuments(db, folder.FolderId);
            ItemFunctions.DeleteFields(db, folderId, true);

            db.Entry(folder).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpDelete("{folderId:Guid}/subfolders"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteSubfolders(Guid folderId)
        {
            using var transactionScope = Utilities.General.CreateTransactionScope();

            foreach (var folder in db.Folders.Where(o => o.ParentFolderId == folderId).ToList())
            {
                ItemFunctions.DeleteDocuments(db, folder.FolderId);
                ItemFunctions.DeleteFields(db, folder.FolderId, true);
            }

            await db.Folders.Where(o => o.ParentFolderId == folderId).ExecuteDeleteAsync();

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpDelete("{folderId:Guid}/foldercontents"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteFolderContents(Guid folderId)
        {
            await db.FolderContents.Where(o => o.FolderId == folderId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
