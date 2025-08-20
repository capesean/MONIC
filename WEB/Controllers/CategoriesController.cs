using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WEB.Models;

namespace WEB.Controllers
{
    [Route("api/[Controller]"), Authorize]
    public class CategoriesController : BaseApiController
    {
        public CategoriesController(IDbContextFactory<ApplicationDbContext> dbFactory, UserManager<User> um, AppSettings appSettings) : base(dbFactory, um, appSettings) { }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] CategorySearchOptions searchOptions)
        {
            IQueryable<Category> results = db.Categories;

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Subcategories);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q) || o.Code.Contains(searchOptions.q));

            results = results.OrderBy(o => o.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{categoryId:Guid}")]
        public async Task<IActionResult> Get(Guid categoryId)
        {
            var category = await db.Categories
                .FirstOrDefaultAsync(o => o.CategoryId == categoryId);

            if (category == null)
                return NotFound();

            var item = await db.Items
               .Include(o => o.ItemFields)
               .Include(o => o.ItemOptions)
               .FirstOrDefaultAsync(o => o.ItemId == categoryId);

            return Ok(ModelFactory.Create(category, true, false, item));
        }

        [HttpPost("{categoryId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid categoryId, [FromBody] CategoryDTO categoryDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (categoryDTO.CategoryId != categoryId) return BadRequest("Id mismatch");

            if (await db.Categories.AnyAsync(o => o.Name == categoryDTO.Name && o.CategoryId != categoryDTO.CategoryId))
                return BadRequest("Category already exists.");

            if (await db.Categories.AnyAsync(o => o.Code == categoryDTO.Code && o.CategoryId != categoryDTO.CategoryId))
                return BadRequest("Code already exists.");

            var isNew = categoryDTO.CategoryId == Guid.Empty;

            Category category;
            if (isNew)
            {
                category = new Category();

                categoryDTO.SortOrder = (await db.Categories.MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(new Item { ItemId = category.CategoryId, ItemType = ItemType.Category }).State = EntityState.Added;

                db.Entry(category).State = EntityState.Added;
            }
            else
            {
                category = await db.Categories
                    .FirstOrDefaultAsync(o => o.CategoryId == categoryDTO.CategoryId);

                if (category == null)
                    return NotFound();

                if (!await db.Items.AnyAsync(o => o.ItemId == category.CategoryId))
                    db.Entry(new Item { ItemId = category.CategoryId, ItemType = ItemType.Category }).State = EntityState.Added;

                db.Entry(category).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(category, categoryDTO);

            if (categoryDTO.ItemFields != null || categoryDTO.ItemOptions != null)
                await ItemFunctions.HydrateFieldsAsync(db, category.CategoryId, categoryDTO.ItemFields, categoryDTO.ItemOptions);

            await db.SaveChangesAsync();

            return await Get(category.CategoryId);
        }

        [HttpDelete("{categoryId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid categoryId)
        {
            var category = await db.Categories
                .FirstOrDefaultAsync(o => o.CategoryId == categoryId);

            if (category == null)
                return NotFound();

            if (await db.Subcategories.AnyAsync(o => o.CategoryId == category.CategoryId))
                return BadRequest("Unable to delete the category as it has related subcategories");

            db.Entry(category).State = EntityState.Deleted;

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                ItemFunctions.DeleteDocuments(db, categoryId);
                ItemFunctions.DeleteFields(db, categoryId, true);

                db.Entry(category).State = EntityState.Deleted;

                await db.SaveChangesAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromBody] Guid[] sortedIds)
        {
            var categories = await db.Categories
                .ToListAsync();
            if (categories.Count != sortedIds.Length) return BadRequest("Some of the categories could not be found");

            foreach (var category in categories)
            {
                db.Entry(category).State = EntityState.Modified;
                category.SortOrder = Array.IndexOf(sortedIds, category.CategoryId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{categoryId:Guid}/subcategories"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteSubcategories(Guid categoryId)
        {
            if (await db.Indicators.AnyAsync(o => o.Subcategory.CategoryId == categoryId))
                return BadRequest("Unable to delete the subcategories as there are related indicators");

            using (var transactionScope = Utilities.General.CreateTransactionScope())
            {
                foreach (var subcategory in db.Subcategories.Where(o => o.CategoryId == categoryId).ToList())
                {
                    ItemFunctions.DeleteDocuments(db, subcategory.SubcategoryId);
                    ItemFunctions.DeleteFields(db, subcategory.SubcategoryId, true);
                }

                await db.Subcategories.Where(o => o.CategoryId == categoryId).ExecuteDeleteAsync();

                await db.SaveChangesAsync();

                transactionScope.Complete();
            }

            return Ok();
        }

    }
}
