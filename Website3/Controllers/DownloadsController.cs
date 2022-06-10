using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System.Threading.Tasks;
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

            Response.Headers.Add("Content-Disposition", report.GetContentDisposition().ToString());

            return File(bytes, report.GetContentType());
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
    }
}