using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WEB.Models;
using WEB.Reports.PDF;

namespace WEB.Controllers
{
    public partial class ResponsesController
    {
        [HttpPost("{responseId:Guid}/unsubmit"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Unsubmit(Guid responseId)
        {
            var response = await CurrentUser.GetPermittedResponsesQuery()
                .FirstOrDefaultAsync(o => o.ResponseId == responseId);

            if (response == null)
                return NotFound();

            if (!response.Submitted) return BadRequest("Response is not submitted");

            response.SubmittedById = null;
            response.SubmittedOnUtc = null;
            db.Entry(response).State = EntityState.Modified;

            await db.SaveChangesAsync();

            return await Get(responseId);
        }

        [HttpPost("{responseId:Guid}/recalculate"), AuthorizeRoles(Roles.Administrator)]
        public async Task<IActionResult> Recalculate(Guid responseId)
        {
            var response = await CurrentUser.GetPermittedResponsesQuery()
                .Include(o => o.Questionnaire)
                .FirstOrDefaultAsync(o => o.ResponseId == responseId);

            if (response == null)
                return NotFound();

            if (!response.Questionnaire.CalculateProgress) return BadRequest("Questionnaire does not calculate progress");

            await response.CalculateProgressAsync(db);
            db.Entry(response).State = EntityState.Modified;

            await db.SaveChangesAsync();

            return await Get(responseId);
        }

    }
}
