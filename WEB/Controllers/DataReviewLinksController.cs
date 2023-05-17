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
    public class DataReviewLinksController : BaseApiController
    {
        public DataReviewLinksController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] DataReviewLinkSearchOptions searchOptions)
        {
            IQueryable<DataReviewLink> results = db.DataReviewLinks;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.DataReview);
                results = results.Include(o => o.Datum);
            }

            if (searchOptions.IndicatorId.HasValue) results = results.Where(o => o.IndicatorId == searchOptions.IndicatorId);
            if (searchOptions.EntityId.HasValue) results = results.Where(o => o.EntityId == searchOptions.EntityId);
            if (searchOptions.DateId.HasValue) results = results.Where(o => o.DateId == searchOptions.DateId);
            if (searchOptions.DataReviewId.HasValue) results = results.Where(o => o.DataReviewId == searchOptions.DataReviewId);

            results = results.OrderBy(o => o.IndicatorId).ThenBy(o => o.EntityId).ThenBy(o => o.DateId).ThenBy(o => o.DataReviewId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{indicatorId:Guid}/{entityId:Guid}/{dateId:Guid}/{dataReviewId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid indicatorId, Guid entityId, Guid dateId, Guid dataReviewId)
        {
            var dataReviewLink = await db.DataReviewLinks
                .Include(o => o.DataReview)
                .Include(o => o.Datum)
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId && o.EntityId == entityId && o.DateId == dateId && o.DataReviewId == dataReviewId);

            if (dataReviewLink == null)
                return NotFound();

            return Ok(ModelFactory.Create(dataReviewLink));
        }

        [HttpPost("{indicatorId:Guid}/{entityId:Guid}/{dateId:Guid}/{dataReviewId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid indicatorId, Guid entityId, Guid dateId, Guid dataReviewId, [FromBody] DataReviewLinkDTO dataReviewLinkDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dataReviewLinkDTO.IndicatorId != indicatorId || dataReviewLinkDTO.EntityId != entityId || dataReviewLinkDTO.DateId != dateId || dataReviewLinkDTO.DataReviewId != dataReviewId) return BadRequest("Id mismatch");

            var dataReviewLink = await db.DataReviewLinks
                .FirstOrDefaultAsync(o => o.IndicatorId == dataReviewLinkDTO.IndicatorId && o.EntityId == dataReviewLinkDTO.EntityId && o.DateId == dataReviewLinkDTO.DateId && o.DataReviewId == dataReviewLinkDTO.DataReviewId);
            var isNew = dataReviewLink == null;

            if (isNew)
            {
                dataReviewLink = new DataReviewLink();

                dataReviewLink.IndicatorId = dataReviewLinkDTO.IndicatorId;
                dataReviewLink.EntityId = dataReviewLinkDTO.EntityId;
                dataReviewLink.DateId = dataReviewLinkDTO.DateId;
                dataReviewLink.DataReviewId = dataReviewLinkDTO.DataReviewId;

                db.Entry(dataReviewLink).State = EntityState.Added;
            }
            else
            {
                db.Entry(dataReviewLink).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(dataReviewLink, dataReviewLinkDTO);

            await db.SaveChangesAsync();

            return await Get(dataReviewLink.IndicatorId, dataReviewLink.EntityId, dataReviewLink.DateId, dataReviewLink.DataReviewId);
        }

        [HttpDelete("{indicatorId:Guid}/{entityId:Guid}/{dateId:Guid}/{dataReviewId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid indicatorId, Guid entityId, Guid dateId, Guid dataReviewId)
        {
            var dataReviewLink = await db.DataReviewLinks
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId && o.EntityId == entityId && o.DateId == dateId && o.DataReviewId == dataReviewId);

            if (dataReviewLink == null)
                return NotFound();

            db.Entry(dataReviewLink).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
