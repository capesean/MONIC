using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WEB.Models;
using WEB.Reports.PDF;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class DownloadsController : BaseApiController
    {
        public DownloadsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet("test"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> TestReport()
        {
            var report = new TestReport(db, AppSettings);

            byte[] bytes = await report.GenerateAsync();

            return Download.GetFileContentResult(Response, report.GetReportName(), bytes);
        }

        //// if using Azure Blob Storage, use something like this to download the document:
        //[HttpGet("documents/{documentId:Guid}")]
        //public async Task<IActionResult> DownloadDocument([FromRoute] Guid documentId)
        //{
        //    var document = await db.Documents.FirstOrDefaultAsync(o => o.DocumentId == documentId);

        //    if (document == null) return NotFound();

        //    var blobStorageService = new BlobStorageService(AppSettings.AzureBlobStorage.ConnectionString, AppSettings.AzureBlobStorage.ConnectionString);
        //    var bytes = await blobStorageService.GetDocumentAsync(documentId);

        //    return Download.GetFileContentResult(Response, document.FileName, bytes);
        //}

    }
}