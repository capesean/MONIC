using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using WEB.Models;
using Task = System.Threading.Tasks.Task;
using File = System.IO.File;

namespace WEB
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string toEmail, string toName, string subject, string bodyText, string bodyHtml = null, bool isErrorEmail = false, List<Attachment> attachments = null, bool textOnly = false, string template = "email");
        Task SendEmailAsync(List<MailAddress> to, string subject, string bodyText, string bodyHtml = null, bool isErrorEmail = false, List<Attachment> attachments = null, bool textOnly = false, string template = "email");
    }

    public class EmailSender : IEmailSender
    {
        private readonly AppSettings _appSettings;

        public EmailSender(AppSettings appSettings)
        {
            _appSettings = appSettings;
        }

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string bodyText, string bodyHtml = null, bool isErrorEmail = false, List<Attachment> attachments = null, bool textOnly = false, string template = "email")
        {
            await SendEmailAsync(new List<MailAddress> { new MailAddress(toEmail, toName) }, subject, bodyText, bodyHtml, isErrorEmail, attachments, textOnly, template);
        }

        public async Task SendEmailAsync(List<MailAddress> to, string subject, string bodyText, string bodyHtml = null, bool isErrorEmail = false, List<Attachment> attachments = null, bool textOnly = false, string template = "email")
        {
            if (!isErrorEmail && !_appSettings.Email.SendEmails)
                return;
            if (isErrorEmail && !_appSettings.Email.SendErrorEmails)
                return;

            var html = bodyText;
            if (!textOnly)
            {
                html = File.ReadAllText(Path.Combine(_appSettings.WebRootPath, "assets/templates/email.html"));
                html = html.Replace("{rootUrl}", _appSettings.RootUrl);
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


            using (var smtp = new SmtpClient(_appSettings.Email.SMTP, _appSettings.Email.SMTPPort))
            {
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential(_appSettings.Email.UserName, _appSettings.Email.Password);
                smtp.EnableSsl = _appSettings.Email.SSL;

                using (var mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(_appSettings.Email.Sender, _appSettings.Email.SenderName);
                    foreach (var address in to)
                    {
                        if (string.IsNullOrWhiteSpace(_appSettings.Email.SubstitutionEmailAddress))
                            mailMessage.To.Add(address);
                        else
                            mailMessage.To.Add(new MailAddress(_appSettings.Email.SubstitutionEmailAddress, address.DisplayName));
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
    }

}
