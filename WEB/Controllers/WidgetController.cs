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
    public class WidgetController : BaseApiController
    {
        public WidgetController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpPost, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Load([FromBody] LoadOptions options)
        {
            var indicator = await db
                .Indicators
                .FirstOrDefaultAsync(o => o.IndicatorId == options.IndicatorId);

            var entities = await db.Entities
                .Where(o => options.EntityIds.Contains(o.EntityId))
                .OrderBy(o => o.Code) // todo?
                .ToListAsync();

            var dates = await db
                .Dates
                .Where(o => o.DateType == options.DateType)
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            var data = await db.Data
                .Where(o => o.IndicatorId == options.IndicatorId && options.EntityIds.Contains(o.EntityId) && o.Date.DateType == options.DateType)
                .ToListAsync();

            return Ok(new
            {
                Indicator = indicator,
                Entities = entities,
                Dates = dates,
                Data = data
            });
        }

        public class LoadOptions
        {
            public Guid IndicatorId { get; set; }
            public Guid[] EntityIds { get; set; }
            public DateType DateType { get; set; }
        }

    }
}
