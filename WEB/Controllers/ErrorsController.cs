using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WEB.Models;
using System.Linq;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), AuthorizeRoles(Roles.Administrator)]
    public class ErrorsController : BaseApiController
    {
        public ErrorsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery]SearchOptions pagingOptions)
        {
            if (pagingOptions == null) pagingOptions = new SearchOptions();

            IQueryable<Models.Error> results = db.Errors;

            results = results.OrderByDescending(o => o.DateUtc);

            return Ok((await GetPaginatedResponse(results, pagingOptions)).Select(o => new { id = o.Id, message = o.Message, dateUtc = o.DateUtc }));
        }

        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var error = await db.Errors
                .Include(o => o.Exception)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (error == null)
                return NotFound();

            if (error.Exception != null) error.Exception.InnerException = await GetInnerExceptionAsync(error.Exception);

            return Ok(error);
        }

        private async Task<ErrorException> GetInnerExceptionAsync(ErrorException exception)
        {
            ErrorException innerException = null;
            if (exception.InnerExceptionId != null)
            {
                innerException = await db.Exceptions.FirstAsync(o => o.Id == exception.InnerExceptionId);
                innerException.InnerException = await GetInnerExceptionAsync(innerException);
            }
            return innerException;
        }
    }
}
