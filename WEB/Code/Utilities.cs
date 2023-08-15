using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using WEB.Models;

namespace WEB.Utilities
{
    public class General
    {
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

        public static string GenerateRandomPassword(PasswordOptions opts = null)
        {
            if (opts == null) opts = new PasswordOptions()
            {
                RequiredLength = 8,
                RequiredUniqueChars = 4,
                RequireDigit = true,
                RequireLowercase = true,
                RequireNonAlphanumeric = true,
                RequireUppercase = true
            };

            string[] randomChars = new[] {
                "ABCDEFGHJKLMNOPQRSTUVWXYZ",    // uppercase 
                "abcdefghijkmnopqrstuvwxyz",    // lowercase
                "0123456789",                   // digits
                "!@$?_-"                        // non-alphanumeric
            };
            Random rand = new Random(Environment.TickCount);
            List<char> chars = new List<char>();

            if (opts.RequireUppercase)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[0][rand.Next(0, randomChars[0].Length)]);

            if (opts.RequireLowercase)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[1][rand.Next(0, randomChars[1].Length)]);

            if (opts.RequireDigit)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[2][rand.Next(0, randomChars[2].Length)]);

            if (opts.RequireNonAlphanumeric)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[3][rand.Next(0, randomChars[3].Length)]);

            for (int i = chars.Count; i < opts.RequiredLength
                || chars.Distinct().Count() < opts.RequiredUniqueChars; i++)
            {
                string rcs = randomChars[rand.Next(0, randomChars.Length)];
                chars.Insert(rand.Next(0, chars.Count),
                    rcs[rand.Next(0, rcs.Length)]);
            }

            return new string(chars.ToArray());
        }

        public static TransactionScope CreateTransactionScope()
        {
            var transactionOptions = new TransactionOptions
            {
                IsolationLevel = IsolationLevel.ReadCommitted,
                Timeout = TransactionManager.MaximumTimeout
            };

            return new TransactionScope(TransactionScopeOption.Required, transactionOptions, TransactionScopeAsyncFlowOption.Enabled);
        }
    }
}
