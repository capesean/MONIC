using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using WEB.Models;
using static WEB.Import.ImportCSV;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class DownloadsController : BaseApiController
    {
        public DownloadsController(ApplicationDbContext _db, UserManager<User> um, AppSettings appSettings) : base(_db, um, appSettings) { }

        [HttpGet("documents/{documentId:Guid}")]
        public async Task<IActionResult> DownloadDocument(Guid documentId)
        {
            var document = await db.Documents.FirstOrDefaultAsync(o => o.DocumentId == documentId);
            if (document == null) return NotFound();

            var item = await db.Items.FirstOrDefaultAsync(o => o.ItemId == document.ItemId);

            if (item.ItemType == ItemType.Folder)
            {
                if (!CurrentUser.IsInRole(Roles.Folders)) return Forbid();
            }
            else
            {
                // todo: check other permissions here...
                if (!CurrentUser.IsInRole(Roles.Administrator)) return Forbid();
            }

            return Download.GetFileContentResult(Response, document.FileName, document.FileContents);
        }

        [HttpPost("export/csv"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> ExportCSV([FromBody] ExportCSVDTO exportCSVDTO)
        {
            var data = await db.Data
                .Where(o => exportCSVDTO.IndicatorIds.Length == 0 || exportCSVDTO.IndicatorIds.Contains(o.IndicatorId))
                .Where(o => exportCSVDTO.EntityIds.Length == 0 || exportCSVDTO.EntityIds.Contains(o.EntityId))
                .Where(o => exportCSVDTO.DateIds.Length == 0 || exportCSVDTO.DateIds.Contains(o.DateId))
                .Select(o =>
                    new CSVRow
                    {
                        IndicatorCode = o.Indicator.Code,
                        EntityCode = o.Entity.Code,
                        DateCode = o.Date.Code,
                        Value = o.Value,
                        Note = o.Note
                    }
                )
                .ToListAsync();

            byte[] contents = null;

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                Delimiter = ",",
                TrimOptions = TrimOptions.Trim
            };

            using (var memoryStream = new MemoryStream())
            using (var streamWriter = new StreamWriter(memoryStream))
            using (var csv = new CsvWriter(streamWriter, config))
            {
                csv.WriteRecords(data);

                csv.Flush();
                streamWriter.Flush();
                contents = memoryStream.ToArray();
            }

            return Download.GetFileContentResult(Response, "MonicDataExport.csv", contents);
        }

        public class ExportCSVDTO
        {
            public Guid[] IndicatorIds { get; set; }
            public Guid[] EntityIds { get; set; }
            public Guid[] DateIds { get; set; }
        }

    }
}