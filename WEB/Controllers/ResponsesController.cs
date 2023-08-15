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
    public partial class ResponsesController : BaseApiController
    {
        public ResponsesController(ApplicationDbContext db, UserManager<User> um, AppSettings appSettings) : base(db, um, appSettings) { }

        [HttpGet, AuthorizeRoles(Roles.Questionnaires)]
        public async Task<IActionResult> Search([FromQuery] ResponseSearchOptions searchOptions)
        {
            IQueryable<Response> results = CurrentUser.GetPermittedResponsesQuery();

            if (searchOptions.IncludeParents)
            {
                results = results.Include(o => o.Questionnaire);
                results = results.Include(o => o.Date);
                results = results.Include(o => o.Entity);
                results = results.Include(o => o.SubmittedBy);
            }

            if (searchOptions.IncludeChildren)
            {
                results = results.Include(o => o.Answers);
            }

            if (searchOptions.QuestionnaireId.HasValue) results = results.Where(o => o.QuestionnaireId == searchOptions.QuestionnaireId);
            if (searchOptions.EntityId.HasValue) results = results.Where(o => o.EntityId == searchOptions.EntityId);
            if (searchOptions.DateId.HasValue) results = results.Where(o => o.DateId == searchOptions.DateId);

            results = results.OrderBy(o => o.ResponseId);

            return Ok((await GetPaginatedResponse(results, searchOptions)).Select(o => ModelFactory.Create(o, searchOptions.IncludeParents, searchOptions.IncludeChildren)));
        }

        [HttpGet("{responseId:Guid}"), AuthorizeRoles(Roles.Questionnaires)]
        public async Task<IActionResult> Get(Guid responseId)
        {
            var response = await CurrentUser.GetPermittedResponsesQuery()
                .Include(o => o.Questionnaire)
                .Include(o => o.Date)
                .Include(o => o.SubmittedBy)
                .Include(o => o.Entity.EntityType)
                .FirstOrDefaultAsync(o => o.ResponseId == responseId);

            if (response == null)
                return NotFound();

            return Ok(ModelFactory.Create(response));
        }

        [HttpPost("{responseId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Save(Guid responseId, [FromBody] ResponseDTO responseDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (responseDTO.ResponseId != responseId) return BadRequest("Id mismatch");

            if (responseDTO.PublicCode != null && await db.Responses.AnyAsync(o => o.PublicCode == responseDTO.PublicCode && o.ResponseId != responseDTO.ResponseId))
                return BadRequest("Public Code already exists.");

            var entity = await db.Entities.Include(o => o.EntityType).FirstAsync(o => o.EntityId == responseDTO.EntityId);
            var questionnaire = await db.Questionnaires.FirstAsync(o => o.QuestionnaireId == responseDTO.QuestionnaireId);
            if (entity.EntityTypeId != questionnaire.EntityTypeId) return BadRequest($"The questionnaire is not applicable to {entity.Name}");

            var date = await db.Dates.FirstAsync(o => o.DateId == responseDTO.DateId);
            if (date.DateType != questionnaire.DateType) return BadRequest($"The questionnaire is not applicable to {date.Name}");

            var isNew = responseDTO.ResponseId == Guid.Empty;

            if (!questionnaire.AllowMultiple && await db.Responses.AnyAsync(o => o.QuestionnaireId == responseDTO.QuestionnaireId && o.EntityId == responseDTO.EntityId && o.DateId == responseDTO.DateId && o.ResponseId != responseDTO.ResponseId))
                return BadRequest($"A Questionnaire Response has already been created for the given {entity.EntityType.Name} and {date.DateType.Label()}");

            Response response;
            if (isNew)
            {
                response = new Response();

                response.CreatedOnUtc = DateTime.UtcNow;

                db.Entry(response).State = EntityState.Added;
            }
            else
            {
                response = await db.Responses
                    .FirstOrDefaultAsync(o => o.ResponseId == responseDTO.ResponseId);

                if (response == null)
                    return NotFound();

                db.Entry(response).State = EntityState.Modified;
            }

            ModelFactory.Hydrate(response, responseDTO);

            if (isNew && questionnaire.CalculateProgress)
                await response.CalculateProgressAsync(db);

            await db.SaveChangesAsync();

            return await Get(response.ResponseId);
        }

        [HttpDelete("{responseId:Guid}"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Delete(Guid responseId)
        {
            var response = await db.Responses
                .FirstOrDefaultAsync(o => o.ResponseId == responseId);

            if (response == null)
                return NotFound();

            using var transactionScope = Utilities.General.CreateTransactionScope();

            foreach (var answer in db.Answers.Where(o => o.ResponseId == response.ResponseId))
            {
                await db.Documents.Where(o => o.ItemId == answer.QuestionId).ExecuteDeleteAsync();

                await db.Items.Where(o => o.ItemId == answer.QuestionId).ExecuteDeleteAsync();

                await db.AnswerOptions.Where(o => o.Answer.QuestionId == answer.QuestionId).ExecuteDeleteAsync();
            }

            await db.Answers.Where(o => o.ResponseId == response.ResponseId).ExecuteDeleteAsync();

            db.Entry(response).State = EntityState.Deleted;

            await db.SaveChangesAsync();

            transactionScope.Complete();

            return Ok();
        }

        [HttpDelete("{responseId:Guid}/answers"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> DeleteAnswers(Guid responseId)
        {
            using var transactionScope = Utilities.General.CreateTransactionScope();

            foreach (var answer in db.Answers.Where(o => o.ResponseId == responseId).ToList())
            {
                await db.Documents.Where(o => o.ItemId == answer.AnswerId).ExecuteDeleteAsync();
                await db.Items.Where(o => o.ItemId == answer.AnswerId).ExecuteDeleteAsync();
                await db.AnswerOptions.Where(o => o.AnswerId == answer.AnswerId).ExecuteDeleteAsync();
            }

            await db.Answers.Where(o => o.ResponseId == responseId).ExecuteDeleteAsync();

            transactionScope.Complete();

            return Ok();
        }

    }
}
