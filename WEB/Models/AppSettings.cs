using Monic.Web.Settings;

namespace Monic.Web.Models
{
    public class AppSettings
    {
        public string RootUrl { get; set; }
        public string RootPath { get; set; }
        public string WebRootPath { get; set; }
        public string SiteName { get; set; }
        public string CertificatePassword { get; set; }
        public bool UseApplicationInsights { get; set; }
        public EmailSettings Email { get; set; }
        public AzureSettings Azure { get; set; }
        public int AccessTokenExpiryMinutes { get; set; }
        public int RefreshTokenExpiryMinutes { get; set; }
    }

    public class AzureSettings
    {
        public string SigningCertificateSubject { get; set; }
        public string EncryptionCertificateSubject { get; set; }

        public DataProtectionSettings DataProtection { get; set; }
        public DocumentsSettings Documents { get; set; }

        public class DataProtectionSettings
        {
            public string BlobUri { get; set; }
            public string KeyIdentifier { get; set; }
        }

    }
}
