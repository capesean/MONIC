using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WEB.Models;
using WEB.Reports.PDF;

namespace WEB.Controllers
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

            return Download.GetFileContentResult(Response, report.GetReportName(), bytes);
        }
    }
}