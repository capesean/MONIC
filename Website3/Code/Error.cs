using System;
using WEB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Extensions;
using System.IO;
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
        Settings _settings;
        IEmailSender _emailSender;
        DbContextOptions _options;

        public ApiExceptionAttribute(Settings settings, IEmailSender emailSender, DbContextOptions options)
        {
            _settings = settings;
            _emailSender = emailSender;
            _options = options;
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
                Logger.Log(context, _settings, _emailSender, _options);
                base.OnException(context);
            }
        }
    }

    public static class Logger
    {
        public static void Log(ExceptionContext context, Settings settings, IEmailSender emailSender, DbContextOptions options)
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

            error.Exception = ProcessExceptions(error, context.Exception);
            error.ExceptionId = error.Exception.Id;

            try
            {
                // use a new context to avoid SaveChanges saving pending commits on another context
                using (var db = new ApplicationDbContext(options))
                {
                    db.Entry(error).State = EntityState.Added;
                    var exception = error.Exception;
                    while (exception != null)
                    {
                        db.Entry(exception).State = EntityState.Added;
                        exception = exception.InnerException;
                    }
                    db.SaveChanges();
                }
            }
            catch { }
            
            if (!string.IsNullOrWhiteSpace(settings.EmailSettings.EmailToErrors))
            {
                var body = string.Empty;
                body += "URL: " + url + Environment.NewLine;
                body += "DATE: " + DateTime.UtcNow.ToString("dd MMMM yyyy, HH:mm:ss") + Environment.NewLine;
                body += "USER: " + userName + Environment.NewLine;
                body += "MESSAGE: " + errorMessage + Environment.NewLine;
                body += "LINK: " + settings.RootUrl + "errors/" + error.Id.ToString().ToLower() + Environment.NewLine;
                body += Environment.NewLine;

                var exception = error.Exception;
                while (exception != null)
                {
                    body += "INNER EXCEPTION: " + exception.Message + Environment.NewLine;
                    body += Environment.NewLine;
                    exception = exception.InnerException;
                }

                body += settings.RootUrl + "api/errors/" + error.Id + Environment.NewLine;

                try
                {
                    emailSender.SendEmailAsync(settings.EmailSettings.EmailToErrors, settings.EmailSettings.EmailToErrors, settings.SiteName + " Error", body, isErrorEmail: true).Wait();
                }
                catch { }
            }
        }

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
