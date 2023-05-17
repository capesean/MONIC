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
    public class DocumentsController : BaseApiController
    {
        public DocumentsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] DocumentSearchOptions searchOptions)
        {
            IQueryable<Document> results = db.Documents
                .SelectExcludingContent();

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Item);
                results = results.Include(o => o.UploadedBy);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.FileName.Contains(searchOptions.q));

            if (searchOptions.ItemId.HasValue) results = results.Where(o => o.ItemId == searchOptions.ItemId);

            results = results.OrderBy(o => o.DocumentId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{documentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid documentId)
        {
            var document = await db.Documents
                .Include(o => o.Item)
                .Include(o => o.UploadedBy)
                .SelectExcludingContent()
                .FirstOrDefaultAsync(o => o.DocumentId == documentId);

            if (document == null)
                return NotFound();

            return Ok(ModelFactory.Create(document));
        }

        [HttpPost("{documentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid documentId, [FromBody] DocumentDTO documentDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (documentDTO.DocumentId != documentId) return BadRequest("Id mismatch");

            var isNew = documentDTO.DocumentId == Guid.Empty;

            Document document;
            if (isNew)
            {
                document = new Document();

                document.UploadedOn = DateTime.UtcNow;
                document.UploadedById = CurrentUser.Id;

                db.Entry(document).State = EntityState.Added;
            }
            else
            {
                document = await db.Documents
                    .SelectExcludingContent()
                    .FirstOrDefaultAsync(o => o.DocumentId == documentDTO.DocumentId);

                if (document == null)
                    return NotFound();

                db.Entry(document).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(document, documentDTO);

            document.Size = document.FileContents.Length;

            await db.SaveChangesAsync();

            return await Get(document.DocumentId);
        }

        [HttpDelete("{documentId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid documentId)
        {
            var document = await db.Documents
                .SelectExcludingContent()
                .FirstOrDefaultAsync(o => o.DocumentId == documentId);

            if (document == null)
                return NotFound();

            db.Entry(document).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
