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
    public partial class QuestionnairesController : BaseApiController
    {
        public QuestionnairesController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Questionnaires)]
        public async Task<IActionResult> Search([FromQuery] QuestionnaireSearchOptions searchOptions)
        {
            IQueryable<Questionnaire> results = db.Questionnaires;

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.EntityType);
                results = results.Include(o => o.Date);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Responses);
                results = results.Include(o => o.Sections);
            }

            if (!string.IsNullOrWhiteSpace(searchOptions.q))
                results = results.Where(o => o.Name.Contains(searchOptions.q));

            if (searchOptions.EntityTypeId.HasValue) results = results.Where(o => o.EntityTypeId == searchOptions.EntityTypeId);
            if (searchOptions.DateType.HasValue) results = results.Where(o => o.DateType == searchOptions.DateType);

            results = results.OrderBy(o => o.Name);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{questionnaireId:Guid}"), AuthorizeRoles(Roles.Questionnaires)]
        public async Task<IActionResult> Get(Guid questionnaireId)
        {
            var questionnaire = await db.Questionnaires
                .Include(o => o.EntityType)
                .Include(o => o.Date)
                .FirstOrDefaultAsync(o => o.QuestionnaireId == questionnaireId);

            if (questionnaire == null)
                return NotFound();

            return Ok(ModelFactory.Create(questionnaire));
        }

        [HttpPost("{questionnaireId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid questionnaireId, [FromBody] QuestionnaireDTO questionnaireDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (questionnaireDTO.QuestionnaireId != questionnaireId) return BadRequest("Id mismatch");

            if (await db.Questionnaires.AnyAsync(o => o.Name == questionnaireDTO.Name && o.QuestionnaireId != questionnaireDTO.QuestionnaireId))
                return BadRequest("Name already exists.");

            var isNew = questionnaireDTO.QuestionnaireId == Guid.Empty;

            Questionnaire questionnaire;
            if (isNew)
            {
                questionnaire = new Questionnaire();

                db.Entry(questionnaire).State = EntityState.Added;
            }
            else
            {
                questionnaire = await db.Questionnaires
                    .FirstOrDefaultAsync(o => o.QuestionnaireId == questionnaireDTO.QuestionnaireId);

                if (questionnaire == null)
                    return NotFound();

                db.Entry(questionnaire).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(questionnaire, questionnaireDTO);

            await db.SaveChangesAsync();

            return await Get(questionnaire.QuestionnaireId);
        }

        [HttpDelete("{questionnaireId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid questionnaireId)
        {
            var questionnaire = await db.Questionnaires
                .FirstOrDefaultAsync(o => o.QuestionnaireId == questionnaireId);

            if (questionnaire == null)
                return NotFound();

            if (await db.Responses.AnyAsync(o => o.QuestionnaireId == questionnaire.QuestionnaireId))
                return BadRequest("Unable to delete the questionnaire as it has related responses");

            using var transactionScope = Utilities.General.CreateTransactionScope();

            await db.Sections.Where(o => o.QuestionnaireId == questionnaire.QuestionnaireId).ExecuteDeleteAsync();

            db.Entry(questionnaire).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpDelete("{questionnaireId:Guid}/sections"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteSections(Guid questionnaireId)
        {
            await db.Sections.Where(o => o.QuestionnaireId == questionnaireId).ExecuteDeleteAsync();

            return Ok();
        }

        [HttpDelete("{questionnaireId:Guid}/responses"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteResponses(Guid questionnaireId)
        {
            await db.Responses.Where(o => o.QuestionnaireId == questionnaireId).ExecuteDeleteAsync();

            return Ok();
        }

    }
}
