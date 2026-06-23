using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using Task = System.Threading.Tasks.Task;
using File = System.IO.File;
using Monic.Web.Models;
using Monic.Web.Settings;

namespace Monic.Web.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string toName, string subject, string bodyText, string bodyHtml = null, bool isErrorEmail = false, List<System.Net.Mail.Attachment> attachments = null, bool textOnly = false, string template = "email");
        Task SendEmailAsync(List<MailAddress> to, string subject, string bodyText, string bodyHtml = null, bool isErrorEmail = false, List<System.Net.Mail.Attachment> attachments = null, bool textOnly = false, string template = "email");
        Task SendWelcomeMailAsync(User user, string password);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(EmailSettings emailSettings)
        {
            _emailSettings = emailSettings;
        }

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string bodyText, string bodyHtml = null, bool isErrorEmail = false, List<System.Net.Mail.Attachment> attachments = null, bool textOnly = false, string template = "email")
        {
            await SendEmailAsync(new List<MailAddress> { new MailAddress(toEmail, toName) }, subject, bodyText, bodyHtml, isErrorEmail, attachments, textOnly, template);
        }

        public async Task SendEmailAsync(List<MailAddress> to, string subject, string bodyText, string bodyHtml = null, bool isErrorEmail = false, List<System.Net.Mail.Attachment> attachments = null, bool textOnly = false, string template = "email")
        {
            if (!isErrorEmail && !_emailSettings.SendEmails)
                return;
            if (isErrorEmail && !_emailSettings.SendErrorEmails)
                return;

            var html = bodyText;
            if (!textOnly)
            {
                html = File.ReadAllText(Path.Combine(_emailSettings.WebRootPath, "assets/templates/email.html"));
                html = html.Replace("{rootUrl}", _emailSettings.RootUrl);
                html = html.Replace("{title}", subject);
                if (bodyHtml == null)
                {
                    bodyHtml = bodyText;
                    while (bodyHtml.IndexOf(Environment.NewLine + Environment.NewLine) >= 0)
                        bodyHtml = bodyHtml.Replace(Environment.NewLine + Environment.NewLine, Environment.NewLine);
                    bodyHtml = "<p>" + string.Join("</p><p>", bodyHtml.Split(new string[] { Environment.NewLine }, StringSplitOptions.None)) + "</p>";
                }
                html = html.Replace("{body}", bodyHtml);
            }


            using (var smtp = new SmtpClient(_emailSettings.SMTP, _emailSettings.SMTPPort))
            {
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential(_emailSettings.UserName, _emailSettings.Password);
                smtp.EnableSsl = _emailSettings.SSL;

                using (var mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(_emailSettings.Sender, _emailSettings.SenderName);
                    foreach (var address in to)
                    {
                        if (string.IsNullOrWhiteSpace(_emailSettings.SubstitutionEmailAddress))
                            mailMessage.To.Add(address);
                        else
                            mailMessage.To.Add(new MailAddress(_emailSettings.SubstitutionEmailAddress, address.DisplayName));
                    }
                    mailMessage.Subject = subject;
                    mailMessage.Body = bodyText;

                    mailMessage.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(bodyText, null, MediaTypeNames.Text.Plain));
                    mailMessage.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(html, null, MediaTypeNames.Text.Html));

                    if (attachments != null)
                        foreach (var attachment in attachments)
                            mailMessage.Attachments.Add(attachment);

                    await smtp.SendMailAsync(mailMessage);
                }
            }
        }

        public async Task SendWelcomeMailAsync(User user, string password)
        {
            var body = user.FirstName + Environment.NewLine;
            body += Environment.NewLine;
            body += "A new account has been created for you on " + _emailSettings.SiteName + "." + Environment.NewLine;
            body += Environment.NewLine;
            body += "To access the site, please login using your email address and the password below:" + Environment.NewLine;
            body += Environment.NewLine;
            body += "<strong>EMAIL/USER ID:</strong> " + user.Email + Environment.NewLine;
            body += "<strong>PASSWORD:</strong> " + password + Environment.NewLine;
            body += "<strong>LOGIN URL:</strong> " + _emailSettings.RootUrl + "auth/login" + Environment.NewLine;
            body += Environment.NewLine;
            body += "You may change your password once you have logged in." + Environment.NewLine;
            body += Environment.NewLine;
            body += "You can reset your password at any time, should you forget it, by following the reset link on the login page." + Environment.NewLine;

            await SendEmailAsync(user.Email, user.FullName, "Account Created", body);
        }

    }
}
