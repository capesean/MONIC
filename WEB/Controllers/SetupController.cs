using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WEB.Controllers;
using WEB.Models;
using WEB.Error;

namespace AuthorizationServer.Controllers
{
    [Route("api/[Controller]")]
    public class SetupController : BaseApiController
    {
        private readonly RoleManager<Role> roleManager;

        public SetupController(
            IDbContextFactory<ApplicationDbContext> dbFactory,
            UserManager<User> _um,
            RoleManager<Role> _rm,
            AppSettings _appSettings
            )
            : base(dbFactory, _um, _appSettings)
        {
            roleManager = _rm;
        }

        [HttpGet, AllowAnonymous]
        public async Task<IActionResult> CheckSetup()
        {
            return Ok(new { runSetup = !await db.Users.AnyAsync() });
        }

        [HttpPost, AllowAnonymous]
        public async Task<IActionResult> RunSetup(SetupDTO setupDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await db.Users.AnyAsync()) throw new HandledException("The database already has a user account.");

            var dbSettings = AppSettings.GetDbSettings(db);

            if (dbSettings.SetupCompleted) throw new HandledException("The setup process has already completed.");

            var user = new User();
            user.FirstName = setupDTO.FirstName;
            user.LastName = setupDTO.LastName;
            user.Email = setupDTO.Email;
            user.UserName = setupDTO.Email;
            user.Disabled = false;

            var saveResult = await userManager.CreateAsync(user, setupDTO.Password);

            if (!saveResult.Succeeded)
                return GetErrorResult(saveResult);

            var appRoles = await roleManager.Roles.ToListAsync();

            foreach (var roleName in appRoles)
                await userManager.AddToRoleAsync(user, roleName.Name);

            // have a flag for these?
            await CreateQuestionOptionGroups();

            dbSettings.SetupCompleted = true;
            db.Entry(dbSettings).State = EntityState.Modified;
            await db.SaveChangesAsync();

            return Ok();
        }

        private async System.Threading.Tasks.Task CreateQuestionOptionGroups()
        {
            var qogFrequency = new QuestionOptionGroup { Name = "Frequency", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFrequency.QuestionOptionGroupId, Label = "Never", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFrequency.QuestionOptionGroupId, Label = "Rarely", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFrequency.QuestionOptionGroupId, Label = "Sometimes", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFrequency.QuestionOptionGroupId, Label = "Often", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFrequency.QuestionOptionGroupId, Label = "Always", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogFrequency).State = EntityState.Added;

            var qogQuality = new QuestionOptionGroup { Name = "Quality", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogQuality.QuestionOptionGroupId, Label = "Very poor", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogQuality.QuestionOptionGroupId, Label = "Poor", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogQuality.QuestionOptionGroupId, Label = "Fair", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogQuality.QuestionOptionGroupId, Label = "Good", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogQuality.QuestionOptionGroupId, Label = "Excellent", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogQuality).State = EntityState.Added;

            var qogIntensity = new QuestionOptionGroup { Name = "Intensity", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogIntensity.QuestionOptionGroupId, Label = "None", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogIntensity.QuestionOptionGroupId, Label = "Very mild", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogIntensity.QuestionOptionGroupId, Label = "Mild", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogIntensity.QuestionOptionGroupId, Label = "Moderate", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogIntensity.QuestionOptionGroupId, Label = "Severe", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogIntensity).State = EntityState.Added;

            var qogAgreement = new QuestionOptionGroup { Name = "Agreement", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAgreement.QuestionOptionGroupId, Label = "Strongly disagree", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAgreement.QuestionOptionGroupId, Label = "Disagree", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAgreement.QuestionOptionGroupId, Label = "Neither agree nor disagree", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAgreement.QuestionOptionGroupId, Label = "Agree", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAgreement.QuestionOptionGroupId, Label = "Strongly agree", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogAgreement).State = EntityState.Added;

            var qogApproval = new QuestionOptionGroup { Name = "Approval", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogApproval.QuestionOptionGroupId, Label = "Strongly disapprove", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogApproval.QuestionOptionGroupId, Label = "Disapprove", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogApproval.QuestionOptionGroupId, Label = "Neutral", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogApproval.QuestionOptionGroupId, Label = "Approve", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogApproval.QuestionOptionGroupId, Label = "Strongly approve", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogApproval).State = EntityState.Added;

            var qogAwareness = new QuestionOptionGroup { Name = "Awareness", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAwareness.QuestionOptionGroupId, Label = "Not at all aware", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAwareness.QuestionOptionGroupId, Label = "Slightly aware", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAwareness.QuestionOptionGroupId, Label = "Moderately aware", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAwareness.QuestionOptionGroupId, Label = "Very aware", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogAwareness.QuestionOptionGroupId, Label = "Extremely aware", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogAwareness).State = EntityState.Added;

            var qogImportance = new QuestionOptionGroup { Name = "Importance", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogImportance.QuestionOptionGroupId, Label = "Not at all important", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogImportance.QuestionOptionGroupId, Label = "Slightly important", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogImportance.QuestionOptionGroupId, Label = "Moderately important", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogImportance.QuestionOptionGroupId, Label = "Very important", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogImportance.QuestionOptionGroupId, Label = "Extremely important", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogImportance).State = EntityState.Added;

            var qogFamiliarity = new QuestionOptionGroup { Name = "Familiarity", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFamiliarity.QuestionOptionGroupId, Label = "Not at all familiar", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFamiliarity.QuestionOptionGroupId, Label = "Slightly familiar", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFamiliarity.QuestionOptionGroupId, Label = "Moderately familiar", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFamiliarity.QuestionOptionGroupId, Label = "Very familiar", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogFamiliarity.QuestionOptionGroupId, Label = "Extremely familiar", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogFamiliarity).State = EntityState.Added;

            var qogSatisfaction = new QuestionOptionGroup { Name = "Satisfaction", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogSatisfaction.QuestionOptionGroupId, Label = "Not at all satisfied", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogSatisfaction.QuestionOptionGroupId, Label = "Slightly satisfied", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogSatisfaction.QuestionOptionGroupId, Label = "Moderately satisfied", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogSatisfaction.QuestionOptionGroupId, Label = "Very satisfied", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogSatisfaction.QuestionOptionGroupId, Label = "Completely satisfied", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogSatisfaction).State = EntityState.Added;

            var qogPerformance = new QuestionOptionGroup { Name = "Performance", Shared = true };
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogPerformance.QuestionOptionGroupId, Label = "Far below standards", Value = 1, Color = "#f8696b", SortOrder = 0 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogPerformance.QuestionOptionGroupId, Label = "Below standards", Value = 2, Color = "#fbaa77", SortOrder = 1 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogPerformance.QuestionOptionGroupId, Label = "Meets standards", Value = 3, Color = "#ffeb84", SortOrder = 2 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogPerformance.QuestionOptionGroupId, Label = "Above standards", Value = 4, Color = "#b1d580", SortOrder = 3 }).State = EntityState.Added;
            db.Entry(new QuestionOption { QuestionOptionGroupId = qogPerformance.QuestionOptionGroupId, Label = "Far above standards", Value = 5, Color = "#63be7b", SortOrder = 4 }).State = EntityState.Added;
            db.Entry(qogPerformance).State = EntityState.Added;

            await db.SaveChangesAsync();
        }
    }
}