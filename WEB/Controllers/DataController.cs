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
    public partial class DataController : BaseApiController
    {
        public DataController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] DatumSearchOptions searchOptions)
        {
            IQueryable<Datum> results = db.Data;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Indicator);
                results = results.Include(o => o.Entity);
                results = results.Include(o => o.LastSavedBy);
                results = results.Include(o => o.Date);
                results = results.Include(o => o.SubmitReview);
                results = results.Include(o => o.VerifyReview);
                results = results.Include(o => o.ApproveReview);
                results = results.Include(o => o.RejectReview);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.DataReviewLinks);
            }

            if (searchOptions.IndicatorId.HasValue) results = results.Where(o => o.IndicatorId == searchOptions.IndicatorId);
            if (searchOptions.EntityId.HasValue) results = results.Where(o => o.EntityId == searchOptions.EntityId);
            if (searchOptions.DateId.HasValue) results = results.Where(o => o.DateId == searchOptions.DateId);
            if (searchOptions.Aggregated.HasValue) results = results.Where(o => o.Aggregated == searchOptions.Aggregated);
            if (searchOptions.SubmitDataReviewId.HasValue) results = results.Where(o => o.SubmitDataReviewId == searchOptions.SubmitDataReviewId);
            if (searchOptions.VerifyDataReviewId.HasValue) results = results.Where(o => o.VerifyDataReviewId == searchOptions.VerifyDataReviewId);
            if (searchOptions.ApproveDataReviewId.HasValue) results = results.Where(o => o.ApproveDataReviewId == searchOptions.ApproveDataReviewId);
            if (searchOptions.RejectDataReviewId.HasValue) results = results.Where(o => o.RejectDataReviewId == searchOptions.RejectDataReviewId);
            if (searchOptions.LastSavedById.HasValue) results = results.Where(o => o.LastSavedById == searchOptions.LastSavedById);
            if (searchOptions.DateType.HasValue) results = results.Where(o => o.Date.DateType == searchOptions.DateType);

            results = results.OrderByDescending(o => o.Date.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{indicatorId:Guid}/{entityId:Guid}/{dateId:Guid}")]
        public async Task<IActionResult> Get(Guid indicatorId, Guid entityId, Guid dateId)
        {
            if (!CurrentUser.HasEntityPermission(entityId))
                return Forbid();

            if (!CurrentUser.HasIndicatorPermission(PermissionType.View, indicatorId))
                return Forbid();

            var datum = await db.Data
                .Include(o => o.Date)
                .Include(o => o.Entity)
                .Include(o => o.SubmitReview.User)
                .Include(o => o.VerifyReview.User)
                .Include(o => o.ApproveReview.User)
                .Include(o => o.RejectReview)
                .Include(o => o.LastSavedBy)
                .Include(o => o.Indicator)
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId && o.EntityId == entityId && o.DateId == dateId);

            if (datum == null)
                return NotFound();

            return Ok(ModelFactory.Create(datum));
        }

        [HttpPost("{indicatorId:Guid}/{entityId:Guid}/{dateId:Guid}")]
        public async Task<IActionResult> Save(Guid indicatorId, Guid entityId, Guid dateId, [FromBody] DatumDTO datumDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!CurrentUser.HasEntityPermission(datumDTO.EntityId))
                return Forbid();

            if (!CurrentUser.HasIndicatorPermission(PermissionType.Edit, datumDTO.IndicatorId))
                return Forbid();

            var indicator = await db.Indicators.FirstOrDefaultAsync(o => o.IndicatorId == indicatorId);
            if (indicator.IndicatorType != IndicatorType.Collected)
                return BadRequest($"Indicator {indicator.Code} is not a Collected Indicator Type");

            if ((await db.Dates.SingleAsync(o => o.DateId == datumDTO.DateId)).DateType != (await db.Indicators.SingleAsync(o => o.IndicatorId == datumDTO.IndicatorId)).Frequency)
                return BadRequest("The Datum date type does not match the Indicator frequency");

            if ((await db.Entities.SingleAsync(o => o.EntityId == datumDTO.EntityId)).EntityTypeId != (await db.Indicators.SingleAsync(o => o.IndicatorId == datumDTO.IndicatorId)).EntityTypeId)
                return BadRequest("The Datum entity type does not match the Indicator entity type");

            if (datumDTO.IndicatorId != indicatorId || datumDTO.EntityId != entityId || datumDTO.DateId != dateId) return BadRequest("Id mismatch");

            var datum = await db.Data
                .FirstOrDefaultAsync(o => o.IndicatorId == datumDTO.IndicatorId && o.EntityId == datumDTO.EntityId && o.DateId == datumDTO.DateId);

            var isNew = datum == null;

            if (isNew)
            {
                datum = new Datum();

                datum.IndicatorId = datumDTO.IndicatorId;
                datum.EntityId = datumDTO.EntityId;
                datum.DateId = datumDTO.DateId;
                datum.LastSavedDateUtc = DateTime.UtcNow;
                datum.LastSavedById = CurrentUser.Id;

                db.Entry(datum).State = EntityState.Added;
            }
            else
            {
                if (datum.Aggregated) return BadRequest("Datum is an aggregated value");
                if (datum.Submitted) return BadRequest("Datum has already been submitted and cannot be edited");
                if (datum.Approved) return BadRequest("Datum has already been approved and cannot be edited");

                datum.LastSavedDateUtc = DateTime.UtcNow;
                datum.LastSavedById = CurrentUser.Id;

                db.Entry(datum).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(datum, datumDTO);

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);
            await calculation.SaveAsync(datum);

            return await Get(datum.IndicatorId, datum.EntityId, datum.DateId);
        }

        [HttpDelete("{indicatorId:Guid}/{entityId:Guid}/{dateId:Guid}")]
        public async Task<IActionResult> Delete(Guid indicatorId, Guid entityId, Guid dateId)
        {
            if (!CurrentUser.HasEntityPermission(entityId))
                return Forbid();

            if (!CurrentUser.HasIndicatorPermission(PermissionType.Edit, indicatorId))
                return Forbid();

            var indicator = await db.Indicators.FirstOrDefaultAsync(o => o.IndicatorId == indicatorId);
            if (indicator.IndicatorType != IndicatorType.Collected)
                return BadRequest($"Indicator {indicator.Code} is not a Collected Indicator Type");

            var datum = await db.Data
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId && o.EntityId == entityId && o.DateId == dateId);

            if (datum == null)
                return NotFound();

            if (datum.Aggregated) return BadRequest("Datum is an aggregated value");
            if (datum.Submitted) return BadRequest("Datum has already been submitted and cannot be deleted");
            if (datum.Approved) return BadRequest("Datum has already been approved and cannot be deleted");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.DataReviewLinks.Where(o => o.IndicatorId == datum.IndicatorId && o.DateId == datum.DateId && o.EntityId == datum.EntityId).ExecuteDeleteAsync();

            // deleted data requires value & note set to null:
            datum.Value = null;
            datum.Note = null;

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);
            await calculation.SaveAsync(datum);

            transactionScope.Complete();

            return Ok();
        }

    }
}
