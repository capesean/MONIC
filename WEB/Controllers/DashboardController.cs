using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WEB.Models;
using Microsoft.AspNetCore.Authorization;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), AllowAnonymous]
    public class DashboardController : BaseApiController
    {
        public DashboardController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var entities = await db.Entities.ToListAsync();
            var entityTypes = await db.EntityTypes.ToListAsync();
            var indicators = await db.Indicators
                .Where(o => o.IndicatorStatus == IndicatorStatus.Enabled)
                .OrderBy(o => o.Subcategory.Category.SortOrder)
                .ThenBy(o => o.Subcategory.SortOrder)
                .ThenBy(o => o.SortOrder)
                .ToListAsync();
            var dates = await db.Dates.ToListAsync();

            var indicatorIds = indicators.Select(o => o.IndicatorId);

            var itemIds = entities.Select(o => o.EntityId).Union(indicatorIds);

            var data = await db.Data.Where(o => o.Indicator.IndicatorStatus == IndicatorStatus.Enabled).Select(o => new { e = o.Entity.Code, d = o.Date.Code, i = o.Indicator.Code, o.Value }).ToListAsync();
            var categories = await db.Categories.ToListAsync();
            var subcategories = await db.Subcategories.ToListAsync();
            var entityLinks = await db.EntityLinks.ToListAsync();
            var fields = await db.Fields.Where(o => o.OptionList.Name != "Life Expectancy at Birth").OrderBy(o => o.SortOrder).ToListAsync();
            var options = await db.Options.Where(o => o.OptionList.Name != "Life Expectancy at Birth").ToListAsync();
            var optionLists = await db.OptionLists.Where(o => o.Name != "Life Expectancy at Birth").ToListAsync();
            var indicatorDates = await db.IndicatorDates.Where(o => indicatorIds.Contains(o.IndicatorId)).ToListAsync();
            var itemFields = await db.ItemFields.Where(o => itemIds.Contains(o.ItemId)).ToListAsync();
            var itemOptions = await db.ItemOptions.Where(o => itemIds.Contains(o.ItemId) && o.Option.OptionList.Name != "Life Expectancy at Birth").ToListAsync();

            return Ok(new
            {
                entities = entities.Select(o => ModelFactory.Create(o)),
                entityTypes = entityTypes.Select(o => ModelFactory.Create(o)),
                indicators = indicators.Select(o => ModelFactory.Create(o)),
                dates = dates.Select(o => ModelFactory.Create(o)),
                data,
                categories = categories.Select(o => ModelFactory.Create(o)),
                subcategories = subcategories.Select(o => ModelFactory.Create(o)),
                entityLinks = entityLinks.Select(o => ModelFactory.Create(o)),
                fields = fields.Select(o => ModelFactory.Create(o)),
                options = options.Select(o => ModelFactory.Create(o)),
                optionLists = optionLists.Select(o => ModelFactory.Create(o)),
                indicatorDates = indicatorDates.Select(o => ModelFactory.Create(o)),
                itemFields = itemFields.Select(o => ModelFactory.Create(o)),
                itemOptions = itemOptions.Select(o => ModelFactory.Create(o))
            });
        }

    }
}
