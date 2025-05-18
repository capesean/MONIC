using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WEB.Controllers
{
    public partial class DataController
    {
        [HttpGet("status")]
        public async Task<IActionResult> DataStatus([FromQuery] Guid[] indicatorIds, [FromQuery] Guid[] entityIds, [FromQuery] Guid[] dateIds)
        {
            //var hasGlobalEdit = CurrentUser.HasElementPermission(db, this.userManager, PermissionType.Edit, PermissionCheckType.Global);

            var noIndicators = indicatorIds == null || !indicatorIds.Any();
            var noEntities = entityIds == null || !entityIds.Any();
            var noDates = dateIds == null || !dateIds.Any();

            var query = from en in db.Entities
                        from @in in db.Indicators
                        from dt in db.Dates
                        join ep in db.EntityPermissions on en.EntityId equals ep.EntityId
                        join d in db.Data on new
                        {
                            @in.IndicatorId,
                            en.EntityId,
                            dt.DateId
                        }
                        equals new
                        {
                            d.IndicatorId,
                            d.EntityId,
                            d.DateId
                        }
                        into temp
                        from datum in temp.DefaultIfEmpty()
                        where
                           // user must have entity permission
                           // todo: handle admin users?
                           // todo: should lower-level users be able to see higher level stats?
                           ep.UserId == CurrentUser.Id
                           // entity is not disabled
                           && !en.Disabled

                           // todo: still needed if providing dateIds?
                           //&& dt.OpenFrom <= DateTime.Today
                           //&& dt.OpenTo >= DateTime.Today

                           // ensure indicator is applicable to the entity type & date - these are the collected data points
                           && (@in.EntityTypeId == en.EntityTypeId)
                           && (@in.Frequency == dt.DateType)

                           // search parameters 
                           && (noIndicators || indicatorIds.Contains(@in.IndicatorId))
                           && (noEntities || entityIds.Contains(en.EntityId))
                           && (noDates || dateIds.Contains(dt.DateId))

                        //&& (categoryId == null || @in.Subcategory.CategoryId == categoryId)
                        //&& (subcategoryId == null || @in.SubcategoryId == subcategoryId)
                        //&& (q == null || en.Name.Contains(q) || en.ShortName.Contains(q) || @in.Name.Contains(q) || dt.Name.Contains(q))

                        //&& (hasGlobalEdit || db.ElementPermissions.Any(o => o.Edit && o.ElementId == @in.ElementId))

                        // filter for missing data:
                        //&& datum.IndicatorId == null

                        select new
                        {
                            status =
                                // is this right?
                               datum.IndicatorId == Guid.Empty ? "Missing" :
                               datum.Approved ? "Approved" :
                               datum.Verified ? "Verified" :
                               datum.Submitted ? "Submitted" :
                               "Captured"
                        }
                         into temp2
                        group temp2 by temp2.status into grouped
                        select new
                        {
                            status = grouped.Key,
                            count = grouped.Count()
                        };

            var statuses = await query.ToListAsync();

            var status = new Status();
            status.Missing = statuses.FirstOrDefault(o => o.status == "Missing")?.count ?? 0;
            status.Captured = statuses.FirstOrDefault(o => o.status == "Captured")?.count ?? 0;
            status.Submitted = statuses.FirstOrDefault(o => o.status == "Submitted")?.count ?? 0;
            status.Verified = statuses.FirstOrDefault(o => o.status == "Verified")?.count ?? 0;
            status.Approved = statuses.FirstOrDefault(o => o.status == "Approved")?.count ?? 0;

            return Ok(status);
        }

        public class Status
        {
            public int Missing { get; set; }
            public int Captured { get; set; }
            public int Submitted { get; set; }
            public int Verified { get; set; }
            public int Approved { get; set; }
        }
    }
}
