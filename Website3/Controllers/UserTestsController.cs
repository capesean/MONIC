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
    public class UserTestsController : BaseApiController
    {
        public UserTestsController(ApplicationDbContext db, UserManager<User> um, Settings settings) : base(db, um, settings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] UserTestSearchOptions searchOptions)
        {
            IQueryable<UserTest> results = db.UserTests;
            
            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.User);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            if (searchOptions.UserId.HasValue) results = results.Where(o => o.UserId == searchOptions.UserId);

            results = results.OrderBy(o => o.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{userTestId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid userTestId)
        {
            var userTest = await db.UserTests
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.UserTestId == userTestId);

            if (userTest == null)
                return NotFound();

            return Ok(ModelFactory.Create(userTest));
        }

        [HttpPost("{userTestId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid userTestId, [FromBody] UserTestDTO userTestDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (userTestDTO.UserTestId != userTestId) return BadRequest("Id mismatch");

            var isNew = userTestDTO.UserTestId == Guid.Empty;

            UserTest userTest;
            if (isNew)
            {
                userTest = new UserTest();

                userTestDTO.SortOrder = (await db.UserTests.Where(o => o.UserId == userTestDTO.UserId).MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(userTest).State = EntityState.Added;
            }
            else
            {
                userTest = await db.UserTests
                    .FirstOrDefaultAsync(o => o.UserTestId == userTestDTO.UserTestId);

                if (userTest == null)
                    return NotFound();

                db.Entry(userTest).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(userTest, userTestDTO);

            await db.SaveChangesAsync();

            return await Get(userTest.UserTestId);
        }

        [HttpDelete("{userTestId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid userTestId)
        {
            var userTest = await db.UserTests
                .FirstOrDefaultAsync(o => o.UserTestId == userTestId);

            if (userTest == null)
                return NotFound();

            db.Entry(userTest).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromQuery] Guid userId, [FromBody] Guid[] sortedIds)
        {
            var userTests = await db.UserTests
                .Where(o => o.UserId == userId)
                .ToListAsync();
            if (userTests.Count != sortedIds.Length) return BadRequest("Some of the user tests could not be found");

            foreach (var userTest in userTests)
            {
                db.Entry(userTest).State = EntityState.Modified;
                userTest.SortOrder = Array.IndexOf(sortedIds, userTest.UserTestId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
