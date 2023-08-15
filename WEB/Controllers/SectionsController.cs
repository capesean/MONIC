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
    public class SectionsController : BaseApiController
    {
        public SectionsController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Search([FromQuery] SectionSearchOptions searchOptions)
        {
            IQueryable<Section> results = db.Sections;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Questionnaire);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Questions);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            if (searchOptions.QuestionnaireId.HasValue) results = results.Where(o => o.QuestionnaireId == searchOptions.QuestionnaireId);

            if (searchOptions.OrderBy == "sortorder")
                results = searchOptions.OrderByAscending ? results.OrderBy(o => o.SortOrder) : results.OrderByDescending(o => o.SortOrder);
            else
                results = results.OrderBy(o => o.SortOrder);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{sectionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Get(Guid sectionId)
        {
            var section = await db.Sections
                .Include(o => o.Questionnaire)
                .FirstOrDefaultAsync(o => o.SectionId == sectionId);

            if (section == null)
                return NotFound();

            return Ok(ModelFactory.Create(section));
        }

        [HttpPost("{sectionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid sectionId, [FromBody] SectionDTO sectionDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (sectionDTO.SectionId != sectionId) return BadRequest("Id mismatch");

            if (await db.Sections.AnyAsync(o => o.QuestionnaireId == sectionDTO.QuestionnaireId && o.Name == sectionDTO.Name && o.SectionId != sectionDTO.SectionId))
                return BadRequest("Name already exists on this Questionnaire.");

            var isNew = sectionDTO.SectionId == Guid.Empty;

            Section section;
            if (isNew)
            {
                section = new Section();

                sectionDTO.SortOrder = (await db.Sections.Where(o => o.QuestionnaireId == sectionDTO.QuestionnaireId).MaxAsync(o => (int?)o.SortOrder) ?? 0) + 1;

                db.Entry(section).State = EntityState.Added;
            }
            else
            {
                section = await db.Sections
                    .FirstOrDefaultAsync(o => o.SectionId == sectionDTO.SectionId);

                if (section == null)
                    return NotFound();

                db.Entry(section).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(section, sectionDTO);

            await db.SaveChangesAsync();

            return await Get(section.SectionId);
        }

        [HttpDelete("{sectionId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid sectionId)
        {
            var section = await db.Sections
                .FirstOrDefaultAsync(o => o.SectionId == sectionId);

            if (section == null)
                return NotFound();

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.Questions.Where(o => o.SectionId == section.SectionId).ExecuteDeleteAsync();

            db.Entry(section).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpPost("sort"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Sort([FromQuery] Guid questionnaireId, [FromBody] Guid[] sortedIds)
        {
            var sections = await db.Sections
                .Where(o => o.QuestionnaireId == questionnaireId)
                .ToListAsync();
            if (sections.Count != sortedIds.Length) return BadRequest("Some of the sections could not be found");

            foreach (var section in sections)
            {
                db.Entry(section).State = EntityState.Modified;
                section.SortOrder = Array.IndexOf(sortedIds, section.SectionId);
            }

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{sectionId:Guid}/questions"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteQuestions(Guid sectionId)
        {
            foreach (var question in db.Questions.Where(o => o.SectionId == sectionId).ToList())
                db.Entry(question).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            return Ok();
        }

    }
}
