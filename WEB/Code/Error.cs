using WEB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace WEB.Error
{
    public class HandledException : Exception
    {
        public HandledException(string message) : base(message) { }
    }

    public class ApiExceptionAttribute : ExceptionFilterAttribute, IFilterMetadata
    {
        private readonly AppSettings appSettings;
        private readonly IEmailSender emailSender;
        private readonly DbContextOptions options;
        private readonly IDbContextFactory<ApplicationDbContext> dbFactory;

        public ApiExceptionAttribute(AppSettings appSettings, IEmailSender emailSender, IDbContextFactory<ApplicationDbContext>dbFactory)
        {
            this.appSettings = appSettings;
            this.emailSender = emailSender;
            this.dbFactory = dbFactory;
        }

        public override void OnException(ExceptionContext context)
        {
            if (context.Exception is HandledException)
            {
                context.Result = new ObjectResult(context.Exception.Message)
                {
                    StatusCode = (int)HttpStatusCode.BadRequest
                };
                context.ExceptionHandled = true;
            }
            else
            {
                Log(context);
                base.OnException(context);
            }
        }

        private void Log(ExceptionContext context)
        {
            if (context.Exception == null) return;
            if (context.Exception.Message == "A task was canceled.") return;

            var request = context.HttpContext.Request;
            var url = request.HttpContext.Request.GetEncodedUrl();
            var userName = context.HttpContext.User.Identity.Name;
            var errorMessage = context.Exception.Message;
            var method = request.Method;

            string form = string.Empty;

            if (request.Method == "POST")
            {
                using (StreamReader sr = new StreamReader(request.Body))
                {
                    if (request.Body.CanSeek) request.Body.Seek(0, SeekOrigin.Begin);
                    if (request.Body.CanRead) form = sr.ReadToEndAsync().Result;
                }
            }

            if (!string.IsNullOrWhiteSpace(form) && form.IndexOf("password", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                form = "<REMOVED DUE TO PASSWORD SENSITIVITY>";
            }

            var error = new Models.Error
            {
                Id = Guid.NewGuid(),
                DateUtc = DateTime.UtcNow,
                Message = errorMessage,
                Url = url,
                UserName = userName,
                Form = form,
                Method = method
            };

            error.Exception = Logger.ProcessExceptions(error, context.Exception);
            error.ExceptionId = error.Exception.Id;

            try
            {
                // use a new context to avoid SaveChanges saving pending commits on another context
                using var db = dbFactory.CreateDbContext();

                db.Entry(error).State = EntityState.Added;
                var exception = error.Exception;
                while (exception != null)
                {
                    db.Entry(exception).State = EntityState.Added;
                    exception = exception.InnerException;
                }
                db.SaveChanges();

            }
            catch { }

            if (!string.IsNullOrWhiteSpace(appSettings.EmailSettings.EmailToErrors))
            {
                var body = string.Empty;
                body += "DATE: " + DateTime.UtcNow.ToString("dd MMMM yyyy, HH:mm:ss") + Environment.NewLine;
                body += "USER: " + userName + Environment.NewLine;
                body += "URL: " + url + Environment.NewLine;
                body += "METHOD: " + method + Environment.NewLine;
                body += "MESSAGE: " + errorMessage + Environment.NewLine;
                body += "LINK: " + appSettings.RootUrl + "errors/" + error.Id.ToString().ToLower() + Environment.NewLine;
                body += Environment.NewLine;

                var exception = error.Exception;
                while (exception != null)
                {
                    body += "INNER EXCEPTION: " + exception.Message + Environment.NewLine;
                    body += Environment.NewLine;
                    exception = exception.InnerException;
                }

                try
                {
                    emailSender.SendEmailAsync(appSettings.EmailSettings.EmailToErrors, appSettings.EmailSettings.EmailToErrors, appSettings.SiteName + " Error", body, isErrorEmail: true).Wait();
                }
                catch { }
            }
        }
    }

    public static class Logger
    {
        public static ErrorException ProcessExceptions(Models.Error error, Exception exception)
        {
            if (exception == null) return null;

            ErrorException innerException = null;

            if (exception.InnerException != null)
                innerException = ProcessExceptions(error, exception.InnerException);

            var errorException = new ErrorException
            {
                Id = Guid.NewGuid(),
                Message = exception.Message,
                StackTrace = exception.StackTrace,
                InnerException = innerException,
                InnerExceptionId = innerException?.InnerExceptionId
            };

            return errorException;
        }

    }
}
