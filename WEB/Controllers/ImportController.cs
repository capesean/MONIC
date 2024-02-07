using WEB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using WEB.Import;
using Microsoft.EntityFrameworkCore;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class ImportController : BaseApiController
    {
        public ImportController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpPost, Route("csv"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> CSV([FromBody] FileContentsDTO fileContentsDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var csvImport = new ImportCSV(db);
            var readOk = await csvImport.ProcessCSV(Convert.FromBase64String(fileContentsDTO.FileContents));
            if (!readOk)
            {
                var errors = csvImport.GetErrors();
                return BadRequest(errors);
            }
            else
            {
                await csvImport.ImportRecordsAsync(CurrentUser.Id, AppSettings);
            }

            return Ok();
        }
    }
}
