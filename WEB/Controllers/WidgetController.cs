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

        [HttpPost("load1"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Load1([FromBody] LoadOptions options)
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
                .Where(o => o.OpenFrom <= DateTime.UtcNow)
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            var dateIds = dates.Select(o => o.DateId).ToArray();

            var data = await db.Data
                .Where(o => o.IndicatorId == options.IndicatorId && options.EntityIds.Contains(o.EntityId) && o.Date.DateType == options.DateType)
                .Where(o => dateIds.Contains(o.DateId))
                .ToListAsync();

            return Ok(new
            {
                Indicator = ModelFactory.Create(indicator),
                Entities = entities.Select(o => ModelFactory.Create(o)),
                Dates = dates.Select(o => ModelFactory.Create(o)),
                Data = data.Select(o => ModelFactory.Create(o))
            });
        }

        [HttpPost("load2"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Load2([FromBody] Load2Options options)
        {
            var indicator = await db
                .Indicators
                .FirstOrDefaultAsync(o => o.IndicatorId == options.IndicatorId);

            var entityType = await db
                .EntityTypes
                .FirstOrDefaultAsync(o => o.EntityTypeId == options.EntityTypeId);

            var entities = await db.Entities
                .Where(o => o.EntityTypeId == options.EntityTypeId)
                .OrderBy(o => o.Code) // todo?
                .ToListAsync();

            var date = await db
                .Dates
                .Where(o => o.DateId == options.DateId)
                .FirstOrDefaultAsync();

            var data = await db.Data
                .Where(o => o.IndicatorId == options.IndicatorId && o.Entity.EntityTypeId == options.EntityTypeId && o.DateId == options.DateId)
                .ToListAsync();

            return Ok(new
            {
                Indicator = ModelFactory.Create(indicator),
                Entities = entities.Select(o => ModelFactory.Create(o)),
                Date = ModelFactory.Create(date),
                Data = data.Select(o => ModelFactory.Create(o)),
                EntityType = ModelFactory.Create(entityType)
            });
        }

        public class LoadOptions
        {
            public Guid IndicatorId { get; set; }
            public Guid[] EntityIds { get; set; }
            public DateType DateType { get; set; }
        }

        public class Load2Options
        {
            public Guid IndicatorId { get; set; }
            public Guid EntityTypeId { get; set; }
            public Guid DateId { get; set; }
        }

    }
}
