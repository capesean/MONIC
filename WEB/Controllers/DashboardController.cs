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
            var indicators = await db.Indicators.ToListAsync();
            var dates = await db.Dates.ToListAsync();
            // optimize!
            var data = await db.Data.ToListAsync();
            //var data = await db.Data.Select(o => new { Entity = o.Entity.Code, Date = o.Date.Code, Indicator = o.Indicator.Code, o.Value }).ToListAsync();
            var categories = await db.Categories.ToListAsync();
            var subcategories = await db.Subcategories.ToListAsync();
            var entityLinks = await db.EntityLinks.ToListAsync();
            var fields = await db.Fields.ToListAsync();
            var itemFields = await db.ItemFields.ToListAsync();
            var options = await db.Options.ToListAsync();
            var optionLists = await db.Options.ToListAsync();
            var itemOptions = await db.ItemOptions.ToListAsync();

            return Ok(new
            {
                entities = entities.Select(o => ModelFactory.Create(o)),
                entityTypes = entityTypes.Select(o => ModelFactory.Create(o)),
                indicators = indicators.Select(o => ModelFactory.Create(o)),
                dates = dates.Select(o => ModelFactory.Create(o)),
                data = data.Select(o => ModelFactory.Create(o)),
                categories = categories.Select(o => ModelFactory.Create(o)),
                subcategories = subcategories.Select(o => ModelFactory.Create(o)),
                entityLinks = entityLinks.Select(o => ModelFactory.Create(o)),
                fields = fields.Select(o => ModelFactory.Create(o)),
                itemFields = itemFields.Select(o => ModelFactory.Create(o)),
                options = options.Select(o => ModelFactory.Create(o)),
                optionLists = optionLists.Select(o => ModelFactory.Create(o)),
                itemOptions = itemOptions.Select(o => ModelFactory.Create(o))
            });
        }

    }
}
