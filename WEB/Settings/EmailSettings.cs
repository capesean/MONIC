namespace Monic.Web.Settings
{
    public class EmailSettings
    {
        public string SenderName { get; set; }
        public string Sender { get; set; }
        public string SubstitutionEmailAddress { get; set; }
        public string EmailToErrors { get; set; }
        public bool SendEmails { get; set; }
        public bool SendErrorEmails { get; set; }
        public string SMTP { get; set; }
        public int SMTPPort { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public bool SSL { get; set; }
        public string RootUrl { get; set; }
        public string SiteName { get; set; }
        public string WebRootPath { get; set; }
    }
}