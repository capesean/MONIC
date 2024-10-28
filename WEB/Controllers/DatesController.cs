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
    public class DatesController : BaseApiController
    {
        public DatesController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] DateSearchOptions searchOptions)
        {
            IQueryable<Date> results = db.Dates;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Quarter);
                results = results.Include(o => o.Year);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.DatesInQuarter);
                results = results.Include(o => o.DatesInYear);
                results = results.Include(o => o.DefaultDateQuestionnaires);
                results = results.Include(o => o.QuestionSummaries);
                results = results.Include(o => o.Responses);
                results = results.Include(o => o.Data);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Code.Contains(searchOptions.q));

            if (searchOptions.DateType.HasValue) results = results.Where(o => o.DateType == searchOptions.DateType);
            if (searchOptions.IsOpen != null) results = results.Where(o => (searchOptions.IsOpen == true && o.OpenFrom <= DateTime.Today && o.OpenTo >= DateTime.Today) || (searchOptions.IsOpen == false && o.OpenTo < DateTime.Today));
            if (searchOptions.HasOpened != null) results = results.Where(o => (searchOptions.HasOpened == true && o.OpenFrom <= DateTime.Today) || (searchOptions.HasOpened == false && o.OpenFrom > DateTime.Today));
            if (searchOptions.QuarterId.HasValue) results = results.Where(o => o.QuarterId == searchOptions.QuarterId);
            if (searchOptions.YearId.HasValue) results = results.Where(o => o.YearId == searchOptions.YearId);

            results = results.OrderByDescending(o => o.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{dateId:Guid}")]
        public async Task<IActionResult> Get(Guid dateId)
        {
            var date = await db.Dates
                .Include(o => o.Quarter)
                .Include(o => o.Year)
                .FirstOrDefaultAsync(o => o.DateId == dateId);

            if (date == null)
                return NotFound();

            return Ok(ModelFactory.Create(date));
        }

        [HttpPost("{dateId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid dateId, [FromBody] DateDTO dateDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dateDTO.DateId != dateId) return BadRequest("Id mismatch");

            if (await db.Dates.AnyAsync(o => o.Name == dateDTO.Name && o.DateId != dateDTO.DateId))
                return BadRequest("Name already exists.");

            if (await db.Dates.AnyAsync(o => o.Code == dateDTO.Code && o.DateId != dateDTO.DateId))
                return BadRequest("Code already exists.");

            if (dateDTO.OpenFrom > dateDTO.OpenTo) return BadRequest("Open From cannot be after Open To");

            var isNew = dateDTO.DateId == Guid.Empty;

            Date date;
            if (isNew)
            {
                date = new Date();

                dateDTO.SortOrder = (await db.Dates.MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(date).State = EntityState.Added;
            }
            else
            {
                date = await db.Dates
                    .FirstOrDefaultAsync(o => o.DateId == dateDTO.DateId);

                if (date == null)
                    return NotFound();

                db.Entry(date).State = EntityState.Modified;
            }

            if (dateDTO.QuarterId.HasValue && (await db.Dates.SingleAsync(o => o.DateId == dateDTO.QuarterId)).DateType != DateType.Quarter)
                return BadRequest("The date selected for the Quarter is not a Quarter");

            if (dateDTO.YearId.HasValue && (await db.Dates.SingleAsync(o => o.DateId == dateDTO.YearId)).DateType != DateType.Year)
                return BadRequest("The date selected for the Year is not a Year");

            ModelFactory.Hydrate(date, dateDTO);

            if (date.DateType != DateType.Quarter) date.Quarter = null;

            await db.SaveChangesAsync();

            return await Get(date.DateId);
        }

        [HttpDelete("{dateId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid dateId)
        {
            var date = await db.Dates
                .FirstOrDefaultAsync(o => o.DateId == dateId);

            if (date == null)
                return NotFound();

            if (await db.Data.AnyAsync(o => o.DateId == date.DateId))
                return BadRequest("Unable to delete the date as it has related data");

            if (await db.Dates.AnyAsync(o => o.QuarterId == date.DateId))
                return BadRequest("Unable to delete the date as it has related dates in quarter");

            if (await db.Dates.AnyAsync(o => o.YearId == date.DateId))
                return BadRequest("Unable to delete the date as it has related dates in year");

            if (await db.Responses.AnyAsync(o => o.DateId == date.DateId))
                return BadRequest("Unable to delete the date as it has related responses");

            if (await db.Questionnaires.AnyAsync(o => o.DefaultDateId == date.DateId))
                return BadRequest("Unable to delete the date as it has related default date questionnaires");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.QuestionSummaries.Where(o => o.DateId == date.DateId).ExecuteDeleteAsync();

            db.Entry(date).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromBody] Guid[] sortedIds)
        {
            var dates = await db.Dates
                .ToListAsync();
            if (dates.Count != sortedIds.Length) return BadRequest("Some of the dates could not be found");

            foreach (var date in dates)
            {
                db.Entry(date).State = EntityState.Modified;
                date.SortOrder = sortedIds.Length - Array.IndexOf(sortedIds, date.DateId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{dateId:Guid}/datesinquarter"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteDatesInQuarter(Guid dateId)
        {
            if (await db.Data.AnyAsync(o => o.Date.QuarterId == dateId))
                return BadRequest("Unable to delete the dates in quarter as there are related data");

            if (await db.Dates.AnyAsync(o => o.QuarterId == dateId))
                return BadRequest("Unable to delete the dates in quarter as there are related dates");

            if (await db.Responses.AnyAsync(o => o.Date.QuarterId == dateId))
                return BadRequest("Unable to delete the dates in quarter as there are related responses");

            if (await db.Questionnaires.AnyAsync(o => o.Date.QuarterId == dateId))
                return BadRequest("Unable to delete the dates in quarter as there are related questionnaires");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.QuestionSummaries.Where(o => o.Date.DateId == dateId).ExecuteDeleteAsync();

            await db.Dates.Where(o => o.QuarterId == dateId).ExecuteDeleteAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpDelete("{dateId:Guid}/datesinyear"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteDatesInYear(Guid dateId)
        {
            if (await db.Data.AnyAsync(o => o.Date.YearId == dateId))
                return BadRequest("Unable to delete the dates in year as there are related data");

            if (await db.Dates.AnyAsync(o => o.YearId == dateId))
                return BadRequest("Unable to delete the dates in year as there are related dates");

            if (await db.Responses.AnyAsync(o => o.Date.YearId == dateId))
                return BadRequest("Unable to delete the dates in year as there are related responses");

            if (await db.Questionnaires.AnyAsync(o => o.Date.YearId == dateId))
                return BadRequest("Unable to delete the dates in year as there are related questionnaires");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.QuestionSummaries.Where(o => o.Date.DateId == dateId).ExecuteDeleteAsync();

            await db.Dates.Where(o => o.YearId == dateId).ExecuteDeleteAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpDelete("{dateId:Guid}/responses"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteResponses(Guid dateId)
        {
            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.Answers.Where(o => o.Response.DateId == dateId).ExecuteDeleteAsync();

            await db.Responses.Where(o => o.DateId == dateId).ExecuteDeleteAsync();

            transactionScope.Complete();

            return Ok();
        }

    }
}
