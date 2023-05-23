using WEB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class FormsController : BaseApiController
    {
        public FormsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, Route("dataentry/{entityId:Guid}/{dateId:Guid}/{permissionType}")]
        public async Task<IActionResult> LoadDataEntry([FromRoute] Guid dateId, [FromRoute] Guid entityId, [FromRoute] PermissionType permissionType)
        {
            if (!CurrentUser.HasEntityPermission(entityId)) return Forbid();

            var entityTypeId = (await db.Entities.FirstAsync(o => o.EntityId == entityId)).EntityTypeId;
            var date = await db.Dates.SingleAsync(o => o.DateId == dateId);

            var dateType = date.DateType;

            var indicators = (await CurrentUser.GetPermittedIndicatorsQuery(permissionType)
                .Include(o => o.Subcategory.Category)
                .Where(o =>
                    o.Frequency == dateType
                    && o.EntityTypeId == entityTypeId
                    && o.IndicatorType == IndicatorType.Collected
                    )
                .OrderBy(o => o.Subcategory.Category.SortOrder)
                .ThenBy(o => o.Subcategory.SortOrder)
                .ThenBy(o => o.SortOrder)
                .ToListAsync())
                .Select(o => ModelFactory.Create(o));

            var indicatorIds = indicators.Select(o => o.IndicatorId).ToArray();

            var data = (await db.Data
                .Where(o => indicatorIds.Contains(o.IndicatorId) && o.EntityId == entityId && o.DateId == dateId)
                .ToListAsync())
                .Select(o => ModelFactory.Create(o));

            return Ok(new
            {
                indicators,
                data
            });
        }

        [HttpPost, Route("dataentry/{entityId:Guid}/{dateId:Guid}/edit")]
        public async Task<IActionResult> SaveDataEntry([FromRoute] Guid dateId, [FromRoute] Guid entityId, [FromBody] DatumDTO[] datumDTOs)
        {
            var entity = await db.Entities.FirstAsync(o => o.EntityId == entityId);
            if (entity == null) return NotFound();

            if (!CurrentUser.HasEntityPermission(entityId)) return BadRequest($"You do not have the permission to modify data for {entity.Name}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (entity.Disabled) return BadRequest($"{entity.Name} has been disabled");

            var date = await db.Dates.SingleAsync(o => o.DateId == dateId);
            if (date.OpenFrom > DateTime.Today || date.OpenTo < DateTime.Today)
            {
                return BadRequest("The date is not open");
            }

            var dateType = date.DateType;
            var indicators = await db.Indicators
                .Where(o => o.IndicatorType == IndicatorType.Collected && o.Frequency == dateType && o.EntityTypeId == entity.EntityTypeId)
                .ToDictionaryAsync(o => o.IndicatorId);
            var dbData = await db.Data
                .Where(o => o.EntityId == entityId && o.DateId == dateId)
                .ToDictionaryAsync(o => o.IndicatorId, o => o);

            var data = new List<Datum>();

            foreach (var datumDTO in datumDTOs)
            {
                if (datumDTO.DateId != dateId) return BadRequest("Date mismatch in data");
                if (datumDTO.EntityId != entityId) return BadRequest("Entity mismatch in data");

                var indicator = indicators[datumDTO.IndicatorId];

                if (!CurrentUser.HasIndicatorPermission(PermissionType.Edit, datumDTO.IndicatorId))
                    return BadRequest($"You do not have the permission to modify data for indicator {indicator.Code}");

                if (indicator.IndicatorType != IndicatorType.Collected)
                    return BadRequest($"Indicator {indicator.Code} is not a Collected Indicator Type");

                Datum datum = null;

                var isNew = !dbData.TryGetValue(datumDTO.IndicatorId, out datum);

                if (!isNew)
                {
                    // todo: move this into the .Save function...
                    // todo: needs useSubmit, useVerify, useApprove checks
                    if (datum.Submitted) return BadRequest("Datum has already been submitted");
                    if (datum.Verified) return BadRequest("Datum has already been verified");
                    if (datum.Approved) return BadRequest("Datum has already been approved");
                }
                else
                {
                    datum = new Datum();
                    datum.EntityId = datumDTO.EntityId;
                    datum.DateId = datumDTO.DateId;
                    datum.IndicatorId = datumDTO.IndicatorId;
                }

                ModelFactory.Hydrate(datum, datumDTO);
                if (string.IsNullOrWhiteSpace(datumDTO.Note)) datum.Note = null;
                data.Add(datum);

            }

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);

            await calculation.SaveAsync(data);

            return await LoadDataEntry(dateId, entityId, PermissionType.Edit);
        }

        [HttpPost, Route("dataentry/{entityId:Guid}/{dateId:Guid}/submit")]
        public async Task<IActionResult> SubmitDataEntry([FromRoute] Guid dateId, [FromRoute] Guid entityId, [FromBody] Guid[] indicatorIds)
        {
            var entity = await db.Entities.FirstAsync(o => o.EntityId == entityId);
            if (entity == null) return NotFound();

            if (!CurrentUser.HasEntityPermission(entityId)) return BadRequest($"You do not have the permission to modify data for {entity.Name}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (entity.Disabled) return BadRequest($"{entity.Name} has been disabled");

            var date = await db.Dates.SingleAsync(o => o.DateId == dateId);
            //if (date.OpenFrom > DateTime.Today || date.OpenTo < DateTime.Today)
            //{
            //    return BadRequest("The date is not open");
            //}

            var dateType = date.DateType;
            var indicators = await db.Indicators
                .Where(o => o.IndicatorType == IndicatorType.Collected && o.Frequency == dateType && o.EntityTypeId == entity.EntityTypeId)
                .ToDictionaryAsync(o => o.IndicatorId);
            var dbData = await db.Data
                .Where(o => o.EntityId == entityId && o.DateId == dateId)
                .ToDictionaryAsync(o => o.IndicatorId, o => o);

            var data = new List<Datum>();

            var utcNow = DateTime.UtcNow;

            // add the review record
            var dataReview = new DataReview();
            dataReview.UserId = CurrentUser.Id;
            dataReview.DateUtc = utcNow;
            dataReview.ReviewStatus = ReviewStatus.Submit;
            dataReview.ReviewResult = ReviewResult.Accepted;
            dataReview.Note = null;
            db.Entry(dataReview).State = EntityState.Added;

            foreach (var indicatorId in indicatorIds)
            {
                var indicator = indicators[indicatorId];

                if (!indicator.RequiresSubmit) BadRequest($"Indicator {indicator.Code} does not require submitting");

                if (!CurrentUser.HasIndicatorPermission(PermissionType.Submit, indicatorId))
                    return BadRequest($"You do not have the permission to submit data for indicator {indicator.Code}");

                if (indicator.IndicatorType != IndicatorType.Collected)
                    return BadRequest($"Indicator {indicator.Code} is not a Collected Indicator Type");

                Datum datum = null;

                var exists = dbData.TryGetValue(indicatorId, out datum);

                if (!exists)
                {
                    // create an empty data point
                    datum = new Datum();
                    datum.EntityId = entity.EntityId;
                    datum.DateId = date.DateId;
                    datum.IndicatorId = indicatorId;
                    datum.LastSavedById = CurrentUser.Id;
                    datum.LastSavedDateUtc = utcNow;

                    // todo: not right: should do in a submit proc/transaction with saving(blanks, dates, etc.)+submitting?
                    db.Entry(datum).State = EntityState.Added;
                }
                else
                {
                    // todo: not right: should do in a submit proc/transaction with saving(blanks, dates, etc.)+submitting?
                    db.Entry(datum).State = EntityState.Modified;
                }

                // todo: needs useSubmit, useVerify, useApprove checks
                if (datum.Submitted) return BadRequest($"Indicator {indicator.Code} has already been submitted");
                if (datum.Verified) return BadRequest($"Indicator {indicator.Code} has already been verified");
                if (datum.Approved) return BadRequest($"Indicator {indicator.Code} has already been approved");

                // link the datum (status) directly to the review
                datum.SubmitDataReviewId = dataReview.DataReviewId;
                // clear any rejection review
                datum.RejectDataReviewId = null;

                data.Add(datum);

                // add the link for this data record to the review
                var dataReviewLink = new DataReviewLink();
                dataReviewLink.IndicatorId = datum.IndicatorId;
                dataReviewLink.EntityId = datum.EntityId;
                dataReviewLink.DateId = datum.DateId;
                dataReviewLink.DataReviewId = dataReview.DataReviewId;
                db.Entry(dataReviewLink).State = EntityState.Added;
            }

            // todo: this should be in a transaction so save can't succeed and calculate fail
            await db.SaveChangesAsync();

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);

            // todo: this will overwrite the LastSaved data (in the proc) - need a proc for submit only, verify only, etc.
            await calculation.SaveAsync(data);

            return await LoadDataEntry(dateId, entityId, PermissionType.Submit);
        }

        [HttpPost, Route("dataentry/{entityId:Guid}/{dateId:Guid}/verify")]
        public async Task<IActionResult> VerifyDataEntry([FromRoute] Guid dateId, [FromRoute] Guid entityId, [FromBody] Guid[] indicatorIds)
        {
            var entity = await db.Entities.FirstAsync(o => o.EntityId == entityId);
            if (entity == null) return NotFound();

            if (!CurrentUser.HasEntityPermission(entityId)) return BadRequest($"You do not have the permission to modify data for {entity.Name}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (entity.Disabled) return BadRequest($"{entity.Name} has been disabled");

            var date = await db.Dates.SingleAsync(o => o.DateId == dateId);
            //if (date.OpenFrom > DateTime.Today || date.OpenTo < DateTime.Today)
            //{
            //    return BadRequest("The date is not open");
            //}

            var dateType = date.DateType;
            var indicators = await db.Indicators
                .Where(o => o.IndicatorType == IndicatorType.Collected && o.Frequency == dateType && o.EntityTypeId == entity.EntityTypeId)
                .ToDictionaryAsync(o => o.IndicatorId);
            var dbData = await db.Data
                .Where(o => o.EntityId == entityId && o.DateId == dateId)
                .ToDictionaryAsync(o => o.IndicatorId, o => o);

            var data = new List<Datum>();

            var utcNow = DateTime.UtcNow;

            // add the review record
            var dataReview = new DataReview();
            dataReview.UserId = CurrentUser.Id;
            dataReview.DateUtc = utcNow;
            dataReview.ReviewStatus = ReviewStatus.Verify;
            dataReview.ReviewResult = ReviewResult.Accepted;
            dataReview.Note = null;
            db.Entry(dataReview).State = EntityState.Added;

            foreach (var indicatorId in indicatorIds)
            {
                var indicator = indicators[indicatorId];

                if (!indicator.RequiresVerify) BadRequest($"Indicator {indicator.Code} does not require verification");

                if (!CurrentUser.HasIndicatorPermission(PermissionType.Verify, indicatorId))
                    return BadRequest($"You do not have the permission to verify data for indicator {indicator.Code}");

                if (indicator.IndicatorType != IndicatorType.Collected)
                    return BadRequest($"Indicator {indicator.Code} is not a Collected Indicator Type");

                Datum datum = null;

                var exists = dbData.TryGetValue(indicatorId, out datum);

                if (!exists)
                {
                    // create an empty data point
                    datum = new Datum();
                    datum.EntityId = entity.EntityId;
                    datum.DateId = date.DateId;
                    datum.IndicatorId = indicatorId;

                    // todo: not right: should do in a submit proc/transaction with saving(blanks, dates, etc.)+submitting?
                    db.Entry(datum).State = EntityState.Added;
                }
                else
                {
                    // todo: not right: should do in a submit proc/transaction with saving(blanks, dates, etc.)+submitting?
                    db.Entry(datum).State = EntityState.Modified;
                }

                // todo: needs useVerify, useVerify, useApprove checks
                if (!datum.Submitted && indicator.RequiresSubmit) return BadRequest($"Indicator {indicator.Code} has not been submitted");
                if (datum.Verified) return BadRequest($"Indicator {indicator.Code} has already been verified");
                if (datum.Approved) return BadRequest($"Indicator {indicator.Code} has already been approved");

                // link the datum (status) directly to the review
                datum.VerifyDataReviewId = dataReview.DataReviewId;
                // clear any rejection review
                datum.RejectDataReviewId = null;

                data.Add(datum);

                // add the link for this data record to the review
                var dataReviewLink = new DataReviewLink();
                dataReviewLink.IndicatorId = datum.IndicatorId;
                dataReviewLink.EntityId = datum.EntityId;
                dataReviewLink.DateId = datum.DateId;
                dataReviewLink.DataReviewId = dataReview.DataReviewId;
                db.Entry(dataReviewLink).State = EntityState.Added;
            }

            // todo: this should be in a transaction so save can't succeed and calculate fail
            await db.SaveChangesAsync();

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);

            // todo: this will overwrite the LastSaved data (in the proc) - need a proc for submit only, verify only, etc.
            await calculation.SaveAsync(data);

            return await LoadDataEntry(dateId, entityId, PermissionType.Verify);
        }

        [HttpPost, Route("dataentry/{entityId:Guid}/{dateId:Guid}/approve")]
        public async Task<IActionResult> ApproveDataEntry([FromRoute] Guid dateId, [FromRoute] Guid entityId, [FromBody] Guid[] indicatorIds)
        {
            var entity = await db.Entities.FirstAsync(o => o.EntityId == entityId);
            if (entity == null) return NotFound();

            if (!CurrentUser.HasEntityPermission(entityId)) return BadRequest($"You do not have the permission to modify data for {entity.Name}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (entity.Disabled) return BadRequest($"{entity.Name} has been disabled");

            var date = await db.Dates.SingleAsync(o => o.DateId == dateId);
            //if (date.OpenFrom > DateTime.Today || date.OpenTo < DateTime.Today)
            //{
            //    return BadRequest("The date is not open");
            //}

            var dateType = date.DateType;
            var indicators = await db.Indicators
                .Where(o => o.IndicatorType == IndicatorType.Collected && o.Frequency == dateType && o.EntityTypeId == entity.EntityTypeId)
                .ToDictionaryAsync(o => o.IndicatorId);
            var dbData = await db.Data
                .Where(o => o.EntityId == entityId && o.DateId == dateId)
                .ToDictionaryAsync(o => o.IndicatorId, o => o);

            var data = new List<Datum>();

            var utcNow = DateTime.UtcNow;

            // add the review record
            var dataReview = new DataReview();
            dataReview.UserId = CurrentUser.Id;
            dataReview.DateUtc = utcNow;
            dataReview.ReviewStatus = ReviewStatus.Approve;
            dataReview.ReviewResult = ReviewResult.Accepted;
            dataReview.Note = null;
            db.Entry(dataReview).State = EntityState.Added;

            foreach (var indicatorId in indicatorIds)
            {
                var indicator = indicators[indicatorId];

                if (!indicator.RequiresApprove) BadRequest($"Indicator {indicator.Code} does not require approval");

                if (!CurrentUser.HasIndicatorPermission(PermissionType.Approve, indicatorId))
                    return BadRequest($"You do not have the permission to approve data for indicator {indicator.Code}");

                if (indicator.IndicatorType != IndicatorType.Collected)
                    return BadRequest($"Indicator {indicator.Code} is not a Collected Indicator Type");

                Datum datum = null;

                var exists = dbData.TryGetValue(indicatorId, out datum);

                if (!exists)
                {
                    // create an empty data point
                    datum = new Datum();
                    datum.EntityId = entity.EntityId;
                    datum.DateId = date.DateId;
                    datum.IndicatorId = indicatorId;

                    // todo: not right: should do in a submit proc/transaction with saving(blanks, dates, etc.)+submitting?
                    db.Entry(datum).State = EntityState.Added;
                }
                else
                {
                    // todo: not right: should do in a submit proc/transaction with saving(blanks, dates, etc.)+submitting?
                    db.Entry(datum).State = EntityState.Modified;
                }

                // todo: needs useVerify, useVerify, useApprove checks
                if (!datum.Submitted && indicator.RequiresSubmit) return BadRequest($"Indicator {indicator.Code} has not been submitted");
                if (!datum.Verified && indicator.RequiresVerify) return BadRequest($"Indicator {indicator.Code} has not been verified");
                if (datum.Approved) return BadRequest($"Indicator {indicator.Code} has already been approved");

                // link the datum (status) directly to the review
                datum.ApproveDataReviewId = dataReview.DataReviewId;
                // clear any rejection review
                datum.RejectDataReviewId = null;

                data.Add(datum);

                // add the link for this data record to the review
                var dataReviewLink = new DataReviewLink();
                dataReviewLink.IndicatorId = datum.IndicatorId;
                dataReviewLink.EntityId = datum.EntityId;
                dataReviewLink.DateId = datum.DateId;
                dataReviewLink.DataReviewId = dataReview.DataReviewId;
                db.Entry(dataReviewLink).State = EntityState.Added;
            }

            // todo: this should be in a transaction so save can't succeed and calculate fail
            await db.SaveChangesAsync();

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);

            // todo: this will overwrite the LastSaved data (in the proc) - need a proc for submit only, verify only, etc.
            await calculation.SaveAsync(data);

            return await LoadDataEntry(dateId, entityId, PermissionType.Approve);
        }

        [HttpPost, Route("dataentry/{entityId:Guid}/{dateId:Guid}/reject/{status}")]
        public async Task<IActionResult> Reject([FromRoute] Guid dateId, [FromRoute] Guid entityId, [FromBody] RejectionDTO rejectionDTO, [FromRoute] ReviewStatus status)
        {
            var entity = await db.Entities.FirstAsync(o => o.EntityId == entityId);
            if (entity == null) return NotFound();

            if (!CurrentUser.HasEntityPermission(entityId)) return BadRequest($"You do not have the permission to modify data for {entity.Name}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (entity.Disabled) return BadRequest($"{entity.Name} has been disabled");

            var date = await db.Dates.SingleAsync(o => o.DateId == dateId);
            //if (date.OpenFrom > DateTime.Today || date.OpenTo < DateTime.Today)
            //{
            //    return BadRequest("The date is not open");
            //}

            var dateType = date.DateType;
            var indicators = await db.Indicators
                .Where(o => o.IndicatorType == IndicatorType.Collected && o.Frequency == dateType && o.EntityTypeId == entity.EntityTypeId)
                .ToDictionaryAsync(o => o.IndicatorId);
            var dbData = await db.Data
                .Where(o => o.EntityId == entityId && o.DateId == dateId)
                .ToDictionaryAsync(o => o.IndicatorId, o => o);

            var data = new List<Datum>();

            var utcNow = DateTime.UtcNow;

            // add the review record
            var dataReview = new DataReview();
            dataReview.UserId = CurrentUser.Id;
            dataReview.DateUtc = utcNow;
            dataReview.ReviewStatus = status;
            dataReview.ReviewResult = ReviewResult.Rejected;
            dataReview.Note = rejectionDTO.Note;
            db.Entry(dataReview).State = EntityState.Added;

            foreach (var indicatorId in rejectionDTO.IndicatorIds)
            {
                var indicator = indicators[indicatorId];

                // todo: are these needed?
                //if (!indicator.RequiresApprove) BadRequest($"Indicator {indicator.Code} does not require approval");

                if (status == ReviewStatus.Verify)
                {
                    if (!CurrentUser.HasIndicatorPermission(PermissionType.Verify, indicatorId))
                        return BadRequest($"You do not have the permission to verify data for indicator {indicator.Code}");
                }
                else if (status == ReviewStatus.Approve)
                {
                    if (!CurrentUser.HasIndicatorPermission(PermissionType.Approve, indicatorId))
                        return BadRequest($"You do not have the permission to approve data for indicator {indicator.Code}");
                }
                else
                    throw new ArgumentException("Invalid status in Reject()");

                if (indicator.IndicatorType != IndicatorType.Collected)
                    return BadRequest($"Indicator {indicator.Code} is not a Collected Indicator Type");

                Datum datum = null;

                var exists = dbData.TryGetValue(indicatorId, out datum);

                if (!exists)
                {
                    return BadRequest($"There is no data record for indicator {indicator.Code}");
                }

                // set the rejection review
                datum.RejectDataReviewId = dataReview.DataReviewId;

                // todo: not right: should do in a submit proc/transaction with saving(blanks, dates, etc.)+submitting?
                db.Entry(datum).State = EntityState.Modified;

                if (status == ReviewStatus.Verify)
                {
                    if (!indicator.RequiresVerify) return BadRequest($"Indicator {indicator.Code} does not require verification");

                    if (!datum.Submitted && indicator.RequiresSubmit) return BadRequest($"Indicator {indicator.Code} has not been submitted");
                    if (datum.Verified) return BadRequest($"Indicator {indicator.Code} has already been verified");
                    if (datum.Approved) return BadRequest($"Indicator {indicator.Code} has already been approved");

                    // undo the submission
                    if (datum.Submitted)
                    {
                        // remove the submission link
                        datum.SubmitDataReviewId = null;
                    }
                }
                else if (status == ReviewStatus.Approve)
                {
                    if (!indicator.RequiresApprove) return BadRequest($"Indicator {indicator.Code} does not require approval");

                    if (!datum.Submitted && indicator.RequiresSubmit) return BadRequest($"Indicator {indicator.Code} has not been submitted");
                    if (!datum.Verified && indicator.RequiresVerify) return BadRequest($"Indicator {indicator.Code} has not been verified");
                    if (datum.Approved) return BadRequest($"Indicator {indicator.Code} has already been approved");

                    // undo the verification
                    if (datum.Verified)
                    {
                        datum.VerifyDataReviewId = null;
                    }

                    // if the indicator doesn't require verification, then rejecting the approve must undo the submission
                    if (!indicator.RequiresVerify && datum.Submitted)
                    {
                        datum.SubmitDataReviewId = null;
                    }
                }

                data.Add(datum);

                // add the link for this data record to the review
                var dataReviewLink = new DataReviewLink();
                dataReviewLink.IndicatorId = datum.IndicatorId;
                dataReviewLink.EntityId = datum.EntityId;
                dataReviewLink.DateId = datum.DateId;
                dataReviewLink.DataReviewId = dataReview.DataReviewId;
                db.Entry(dataReviewLink).State = EntityState.Added;
            }

            // todo: this should be in a transaction so save can't succeed and calculate fail
            await db.SaveChangesAsync();

            var calculation = new Calculation(db, AppSettings, CurrentUser.Id);

            // todo: this will overwrite the LastSaved data (in the proc) - need a proc for submit only, verify only, etc.
            await calculation.SaveAsync(data);

            return await LoadDataEntry(dateId, entityId, status == ReviewStatus.Verify ? PermissionType.Verify : PermissionType.Approve);
        }

        [HttpGet, Route("dataentry/{entityId:Guid}/{dateId:Guid}/{indicatorId:Guid}/datareviews")]
        public async Task<IActionResult> GetDataReviews([FromRoute] Guid dateId, [FromRoute] Guid entityId, [FromRoute] Guid indicatorId)
        {
            var entity = await db.Entities.FirstAsync(o => o.EntityId == entityId);
            if (entity == null) return NotFound();

            if (!CurrentUser.HasEntityPermission(entityId)) return BadRequest($"You do not have the permission to modify data for {entity.Name}");

            if (entity.Disabled) return BadRequest($"{entity.Name} has been disabled");

            var indicator = await db.Indicators.FirstOrDefaultAsync(o => o.IndicatorId == indicatorId);
            if (indicator == null) return NotFound();

            if (!CurrentUser.HasIndicatorPermission(PermissionType.View, indicatorId))
                return BadRequest($"You do not have permission to view indicator {indicator.Code}");

            return Ok(
                (await db.DataReviews
                    .Include(o => o.User)
                    .Where(o => o.DataReviewLinks.Any(l => l.EntityId == entityId && l.IndicatorId == indicatorId && l.DateId == dateId))
                    .OrderByDescending(o => o.DateUtc)
                    .ToListAsync())
                .Select(o => ModelFactory.Create(o)));
        }

        public class RejectionDTO
        {
            public Guid[] IndicatorIds { get; set; }
            public string Note { get; set; }
        }
    }
}
