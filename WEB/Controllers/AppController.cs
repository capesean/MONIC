using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using WEB.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml.Table.PivotTable;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class AppController : BaseApiController
    {
        public AppController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings)
            : base(dbFactory, um, appSettings) { }

        [HttpGet, Route("settings")]
        public IActionResult Get()
        {
            // return the settings for all logged in users
            return Ok(
                new
                {
                    dbSettings.SetupCompleted,
                    dbSettings.UseSubmit,
                    dbSettings.UseVerify,
                    dbSettings.UseApprove,
                    dbSettings.UseReject
                }
            );
        }

        // needs to be run on login page (anonymous)
        [HttpGet, Route("setupcheck"), AllowAnonymous]
        public IActionResult SetupCheck()
        {
            return Ok(
                new
                {
                    dbSettings.SetupCompleted
                }
            );
        }

        [HttpGet, Route("fielddata")]
        public async Task<IActionResult> GetFieldData()
        {
            var fields = await db.Fields
                .Include(o => o.OptionList)
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            var groups = await db.Groups
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            var fieldData = new FieldData
            {
                Fields = [.. fields.Select(o => ModelFactory.Create(o))],
                Groups = [.. groups.Select(o => ModelFactory.Create(o))]
            };

            // add a blank option to unselect the selected value
            foreach (var field in fieldData.Fields)
            {
                if (field.FieldType == FieldType.OptionList)
                {
                    var options = await db.Options.Where(o => o.OptionListId == field.OptionListId)
                        .OrderBy(o => o.SortOrder)
                        .ToListAsync();

                    if (!field.Multiple && !field.Required && !field.RadioCheckbox)
                        options.Insert(0, new Option { OptionListId = field.OptionListId.Value, OptionId = Guid.Empty, Name = string.Empty, SortOrder = -1 });

                    field.OptionList.Options = [.. options.Select(o => ModelFactory.Create(o))];
                }
            }

            return Ok(fieldData);
        }

        public class FieldData
        {
            public IEnumerable<FieldDTO> Fields { get; set; }
            public IEnumerable<GroupDTO> Groups { get; set; }
        }
    }
}
