using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System.Net.Mime;
using WEB.Controllers;
using WEB.Models;
using WEB.Reports.PDF;

namespace KPI.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class DownloadsController : BaseApiController
    {
        public DownloadsController(ApplicationDbContext _db, UserManager<User> um, Settings _settings) : base(_db, um, _settings) { }

        [HttpGet("test"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> TestReport()
        {
            var report = new TestReport(db, Settings);

            byte[] bytes = await report.GenerateAsync();

            return DownloadResult(report.GetReportName(), bytes);
        }

        private FileContentResult DownloadResult(string fileName, byte[] fileContents)
        {
            Response.Headers.Add("Content-Disposition", GetContentDisposition(fileName).ToString());

            return new FileContentResult(fileContents, GetContentType(fileName))
            {
                FileDownloadName = fileName
            };
        }

        private string GetContentType(string fileName)
        {
            var provider = new FileExtensionContentTypeProvider();
            string contentType;
            if (!provider.TryGetContentType(fileName, out contentType))
            {
                contentType = "application/octet-stream";
            }
            return contentType;
        }

        private ContentDisposition GetContentDisposition(string fileName)
        {
            return new ContentDisposition
            {
                FileName = string.Format(fileName),
                Inline = false,
            };
        }
    }
}