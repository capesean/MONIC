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
    public class DataReviewsController : BaseApiController
    {
        public DataReviewsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] DataReviewSearchOptions searchOptions)
        {
            IQueryable<DataReview> results = db.DataReviews;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.User);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.DataReviewLinks);
                results = results.Include(o => o.SubmittedData);
                results = results.Include(o => o.VerifiedData);
                results = results.Include(o => o.ApprovedData);
                results = results.Include(o => o.RejectedData);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Note.Contains(searchOptions.q));

            if (searchOptions.UserId.HasValue) results = results.Where(o => o.UserId == searchOptions.UserId);
            if (searchOptions.ReviewStatus.HasValue) results = results.Where(o => o.ReviewStatus == searchOptions.ReviewStatus);

            results = results.OrderByDescending(o => o.DateUtc);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{dataReviewId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid dataReviewId)
        {
            var dataReview = await db.DataReviews
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.DataReviewId == dataReviewId);

            if (dataReview == null)
                return NotFound();

            return Ok(ModelFactory.Create(dataReview));
        }

        [HttpPost("{dataReviewId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid dataReviewId, [FromBody] DataReviewDTO dataReviewDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dataReviewDTO.DataReviewId != dataReviewId) return BadRequest("Id mismatch");

            var isNew = dataReviewDTO.DataReviewId == Guid.Empty;

            DataReview dataReview;
            if (isNew)
            {
                dataReview = new DataReview();

                db.Entry(dataReview).State = EntityState.Added;
            }
            else
            {
                dataReview = await db.DataReviews
                    .FirstOrDefaultAsync(o => o.DataReviewId == dataReviewDTO.DataReviewId);

                if (dataReview == null)
                    return NotFound();

                db.Entry(dataReview).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(dataReview, dataReviewDTO);

            await db.SaveChangesAsync();

            return await Get(dataReview.DataReviewId);
        }

        [HttpDelete("{dataReviewId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid dataReviewId)
        {
            var dataReview = await db.DataReviews
                .FirstOrDefaultAsync(o => o.DataReviewId == dataReviewId);

            if (dataReview == null)
                return NotFound();

            foreach (var dataReviewLink in db.DataReviewLinks.Where(o => o.DataReviewId == dataReview.DataReviewId))
                db.Entry(dataReviewLink).State = EntityState.Deleted;

            if (await db.Data.AnyAsync(o => o.SubmitDataReviewId == dataReview.DataReviewId))
                return BadRequest("Unable to delete the data review as it has related data");

            if (await db.Data.AnyAsync(o => o.VerifyDataReviewId == dataReview.DataReviewId))
                return BadRequest("Unable to delete the data review as it has related data");

            if (await db.Data.AnyAsync(o => o.ApproveDataReviewId == dataReview.DataReviewId))
                return BadRequest("Unable to delete the data review as it has related data");

            if (await db.Data.AnyAsync(o => o.RejectDataReviewId == dataReview.DataReviewId))
                return BadRequest("Unable to delete the data review as it has related data");

            db.Entry(dataReview).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
