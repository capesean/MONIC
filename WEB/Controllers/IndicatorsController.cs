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
    public partial class IndicatorsController : BaseApiController
    {
        public IndicatorsController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] IndicatorSearchOptions searchOptions)
        {
            IQueryable<Indicator> results = CurrentUser.GetPermittedIndicatorsQuery(permissionType: PermissionType.View);

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.CreatedBy);
                results = results.Include(o => o.Subcategory.Category);
                results = results.Include(o => o.EntityType);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Data);
                results = results.Include(o => o.IndicatorPermissions);
                results = results.Include(o => o.LogFrameRowIndicators);
                results = results.Include(o => o.SourceTokens);
                results = results.Include(o => o.ComponentIndicators);
                results = results.Include(o => o.Tokens);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Code.Contains(searchOptions.q));

            if (searchOptions.SubcategoryId.HasValue) results = results.Where(o => o.SubcategoryId == searchOptions.SubcategoryId);
            if (searchOptions.CategoryId.HasValue) results = results.Where(o => o.Subcategory.CategoryId == searchOptions.CategoryId);
            if (searchOptions.IndicatorType.HasValue) results = results.Where(o => o.IndicatorType == searchOptions.IndicatorType);
            if (searchOptions.IndicatorStatus.HasValue) results = results.Where(o => o.IndicatorStatus == searchOptions.IndicatorStatus);
            if (searchOptions.EntityTypeId.HasValue) results = results.Where(o => o.EntityTypeId == searchOptions.EntityTypeId);
            if (searchOptions.Frequency.HasValue) results = results.Where(o => o.Frequency == searchOptions.Frequency);
            if (searchOptions.CreatedById.HasValue) results = results.Where(o => o.CreatedById == searchOptions.CreatedById);

            results = results.OrderBy(o => o.Subcategory.Category.SortOrder).ThenBy(o => o.Subcategory.SortOrder).ThenBy(o => o.SortOrder).ThenBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{indicatorId:Guid}")]
        public async Task<IActionResult> Get(Guid indicatorId)
        {
            if (!CurrentUser.IsInRole(Roles.Administrator) && !CurrentUser.IsInRole(Roles.Manager) && !CurrentUser.HasIndicatorPermission(PermissionType.View, indicatorId))
                return Forbid();

            var indicator = await db.Indicators
                .Include(o => o.Subcategory.Category)
                .Include(o => o.EntityType)
                .Include(o => o.CreatedBy)
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId);

            if (indicator == null)
                return NotFound();

            var item = await db.Items
               .Include(o => o.FieldValues)
               .Include(o => o.OptionValues)
               .FirstOrDefaultAsync(o => o.ItemId == indicatorId);

            var indicatorDTO = ModelFactory.Create(indicator, true, false, item);

            //organisationDTO.Files = (await db.Files
            //    .Where(o => o.OrganisationId == organisation.OrganisationId)
            //    .Select(o => new File { FileId = o.FileId, FieldId = o.FieldId, FileName = o.FileName, UploadedOn = o.UploadedOn, OrganisationId = o.OrganisationId })
            //    .ToListAsync())
            //    .Select(o => ModelFactory.Create(o))
            //    .ToList();

            return Ok(indicatorDTO);
        }

        [HttpPost("{indicatorId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid indicatorId, [FromBody] IndicatorDTO indicatorDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!indicatorDTO.ValidateFields(db, ItemType.Indicator, out var error)) { return BadRequest(error); }

            if (indicatorDTO.IndicatorId != indicatorId) return BadRequest("Id mismatch");

            if (await db.Indicators.AnyAsync(o => o.Name == indicatorDTO.Name && o.IndicatorId != indicatorDTO.IndicatorId))
                return BadRequest("Name already exists.");

            if (await db.Indicators.AnyAsync(o => o.Code == indicatorDTO.Code && o.IndicatorId != indicatorDTO.IndicatorId))
                return BadRequest("Code already exists.");

            var isNew = indicatorDTO.IndicatorId == Guid.Empty;

            Indicator indicator;
            if (isNew)
            {
                indicator = new Indicator();

                indicator.CreatedDateUtc = DateTime.UtcNow;
                indicator.CreatedById = CurrentUser.Id;
                indicator.LastSavedDateUtc = DateTime.UtcNow;
                indicator.LastSavedById = CurrentUser.Id;

                indicatorDTO.SortOrder = (await db.Indicators.MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(new Item { ItemId = indicator.IndicatorId, ItemType = ItemType.Indicator }).State = EntityState.Added;

                db.Entry(indicator).State = EntityState.Added;
            }
            else
            {
                indicator = await db.Indicators
                    .FirstOrDefaultAsync(o => o.IndicatorId == indicatorDTO.IndicatorId);

                if (indicator == null)
                    return NotFound();

                indicator.LastSavedDateUtc = DateTime.UtcNow;
                indicator.LastSavedById = CurrentUser.Id;

                db.Entry(indicator).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(indicator, indicatorDTO, isNew);

            await ItemFunctions.HydrateFieldsAsync(db, indicator.IndicatorId, indicatorDTO.FieldValues, indicatorDTO.OptionValues);

            await db.SaveChangesAsync();

            return await Get(indicator.IndicatorId);
        }

        [HttpDelete("{indicatorId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid indicatorId)
        {
            var indicator = await db.Indicators
                .FirstOrDefaultAsync(o => o.IndicatorId == indicatorId);

            if (indicator == null)
                return NotFound();

            if (await db.Tokens.AnyAsync(o => o.SourceIndicatorId == indicator.IndicatorId))
                return BadRequest("Unable to delete the indicator as it has related source tokens");

            if (await db.LogFrameRowIndicators.AnyAsync(o => o.IndicatorId == indicator.IndicatorId))
                return BadRequest("Unable to delete the indicator as it has related log frame row indicators");

            if (await db.ComponentIndicators.AnyAsync(o => o.IndicatorId == indicator.IndicatorId))
                return BadRequest("Unable to delete the indicator as it has related component indicators");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.Tokens.Where(o => o.IndicatorId == indicator.IndicatorId).ExecuteDeleteAsync();

            await db.Data.Where(o => o.IndicatorId == indicator.IndicatorId).ExecuteDeleteAsync();

            await db.IndicatorPermissions.Where(o => o.IndicatorId == indicator.IndicatorId).ExecuteDeleteAsync();

            ItemFunctions.DeleteFields(db, indicatorId, true);

            db.Entry(indicator).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromQuery] Guid subcategoryId, [FromBody] Guid[] sortedIds)
        {
            var indicators = await db.Indicators
                .Where(o => o.SubcategoryId == subcategoryId)
                .ToListAsync();
            if (indicators.Count != sortedIds.Length) return BadRequest("Some of the indicators could not be found");

            foreach (var indicator in indicators)
            {
                db.Entry(indicator).State = EntityState.Modified;
                indicator.SortOrder = Array.IndexOf(sortedIds, indicator.IndicatorId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{indicatorId:Guid}/logframerowindicators"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteLogFrameRowIndicators(Guid indicatorId)
        {
            await db.LogFrameRowIndicators.Where(o => o.IndicatorId == indicatorId).ExecuteDeleteAsync();

            return Ok();
        }

        [HttpDelete("{indicatorId:Guid}/componentindicators"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteComponentIndicators(Guid indicatorId)
        {
            await db.ComponentIndicators.Where(o => o.IndicatorId == indicatorId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
