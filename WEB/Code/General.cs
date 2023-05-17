using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Transactions;
using WEB.Models;
using Task = System.Threading.Tasks.Task;

namespace WEB.Utilities
{
    public static class General
    {
        public static List<DateType> GetParentDateTypes(DateType dateType)
        {
            var parentDateTypes = new List<DateType>();

            if (dateType == DateType.Year) return parentDateTypes;
            parentDateTypes.Add(DateType.Year);
            if (dateType == DateType.Month) parentDateTypes.Add(DateType.Quarter);
            return parentDateTypes;
        }

        public static async Task SendWelcomeMailAsync(User user, string password, AppSettings appSettings)
        {
            var body = user.FirstName + Environment.NewLine;
            body += Environment.NewLine;
            body += "A new account has been created for you on " + appSettings.SiteName + "." + Environment.NewLine;
            body += Environment.NewLine;
            body += "To access the site, please login using your email address and the password below:" + Environment.NewLine;
            body += Environment.NewLine;
            body += "<strong>EMAIL/USER ID:</strong> " + user.Email + Environment.NewLine;
            body += "<strong>PASSWORD:</strong> " + password + Environment.NewLine;
            body += "<strong>LOGIN URL:</strong> " + appSettings.RootUrl + "auth/login" + Environment.NewLine;
            body += Environment.NewLine;
            body += "You may change your password once you have logged in." + Environment.NewLine;
            body += Environment.NewLine;
            body += "You can reset your password at any time, should you forget it, by following the reset link on the login page." + Environment.NewLine;

            await new EmailSender(appSettings).SendEmailAsync(user.Email, user.FullName, "Account Created", body);
        }

        public static string GetStringValue(Datum datum)
        {
            if (datum == null || datum.Value == null) return string.Empty;
            return string.Format("{0:0.########}", datum.Value);
        }

        public static string GenerateRandomPassword(PasswordOptions options)
        {

            string[] randomChars = new[] {
                "ABCDEFGHJKLMNOPQRSTUVWXYZ",    // uppercase 
                "abcdefghijkmnopqrstuvwxyz",    // lowercase
                "0123456789",                   // digits
                "!@$?_-"                        // non-alphanumeric
            };

            Random rand = new Random(Environment.TickCount);
            List<char> chars = new List<char>();

            if (options.RequireUppercase)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[0][rand.Next(0, randomChars[0].Length)]);

            if (options.RequireLowercase)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[1][rand.Next(0, randomChars[1].Length)]);

            if (options.RequireDigit)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[2][rand.Next(0, randomChars[2].Length)]);

            if (options.RequireNonAlphanumeric)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[3][rand.Next(0, randomChars[3].Length)]);

            for (int i = chars.Count; i < options.RequiredLength
                || chars.Distinct().Count() < options.RequiredUniqueChars; i++)
            {
                string rcs = randomChars[rand.Next(0, randomChars.Length)];
                chars.Insert(rand.Next(0, chars.Count),
                            rcs[rand.Next(0, rcs.Length)]);
            }

            return new string(chars.ToArray());
        }

        public static async Task<int> GetTotalRowCountAsync(ApplicationDbContext db, Guid dateId, Guid organisationId, Guid? clusterId = null, Guid? privateOperatorId = null)
        {
            return await (from el in db.Indicators
                          from en in db.Entities
                          from dt in db.Dates
                          where (
                            !en.Disabled
                            && dt.DateId == dateId
                            && el.EntityTypeId == en.EntityTypeId
                            && el.ReportingFrequency == dt.DateType
                            && en.OrganisationId == organisationId
                            && (clusterId == null || en.EntityId == clusterId || en.ParentEntities.Any(o => o.ParentEntityId == clusterId))
                            && (privateOperatorId == null || en.EntityId == privateOperatorId)
                          )
                          select new
                          {
                              row = 1
                          }
                 ).CountAsync();
        }

        public static async Task<int> GetCompletedRowCountAsync(ApplicationDbContext db, Guid dateId, Guid organisationId, Guid? clusterId = null, Guid? privateOperatorId = null)
        {
            return await db.Data
                .Where(o => !o.Entity.Disabled
                    && o.Entity.OrganisationId == organisationId
                    && o.DateId == dateId
                    && !o.Aggregated
                    && (clusterId == null || o.Entity.EntityId == clusterId || o.Entity.ParentEntities.Any(el => el.ParentEntityId == clusterId))
                    && (privateOperatorId == null || o.Entity.EntityId == privateOperatorId)
                    )
                .CountAsync();
        }

        public static TransactionScope CreateTransactionScope()
        {
            var transactionOptions = new TransactionOptions();
            transactionOptions.IsolationLevel = IsolationLevel.ReadCommitted;
            transactionOptions.Timeout = TransactionManager.MaximumTimeout;
            return new TransactionScope(TransactionScopeOption.Required, transactionOptions, TransactionScopeAsyncFlowOption.Enabled);
        }
    }
}