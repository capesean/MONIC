using System.Security.Cryptography.X509Certificates;
using System.Security.Cryptography;
using WEB.Models;
using System.Net;

namespace WEB
{
    public static class Certificates
    {
        public static string GetEncryptionCertificatePath(AppSettings appSettings) => Path.Combine(appSettings.RootPath, "encryption-certificate.pfx");
        public static string GetSigningCertificatePath(AppSettings appSettings) => Path.Combine(appSettings.RootPath, "signing-certificate.pfx");

        public static void CreateEncryptionCertificate(AppSettings appSettings)
        {
            using var algorithm = RSA.Create(keySizeInBits: 2048);

            var subject = new X500DistinguishedName("CN=Fabrikam Encryption Certificate");
            var request = new CertificateRequest(subject, algorithm, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
            request.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.KeyEncipherment, critical: true));

            var certificate = request.CreateSelfSigned(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(2));

            File.WriteAllBytes(GetEncryptionCertificatePath(appSettings), certificate.Export(X509ContentType.Pfx, appSettings.CertificatePassword));
        }

        public static void CreateSigningCertificate(AppSettings appSettings)
        {
            using var algorithm = RSA.Create(keySizeInBits: 2048);

            var subject = new X500DistinguishedName("CN=Fabrikam Signing Certificate");
            var request = new CertificateRequest(subject, algorithm, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
            request.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, critical: true));

            var certificate = request.CreateSelfSigned(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(2));

            File.WriteAllBytes(GetSigningCertificatePath(appSettings), certificate.Export(X509ContentType.Pfx, appSettings.CertificatePassword));
        }
    }

    public static class X509Certificate
    {
        public static X509Certificate2 GetCertificate(AppSettings appSettings)
        {
            var certificatePath = Path.Combine(appSettings.RootPath, "certificate.pfx");
            if (!File.Exists(certificatePath))
            {
                var certificate = BuildSelfSignedServerCertificate(appSettings.SiteName, appSettings.CertificatePassword);
                var bytes = certificate.Export(X509ContentType.Pfx, appSettings.CertificatePassword);
                File.WriteAllBytes(certificatePath, bytes);
                return certificate;
            }
            else
            {
                return new X509Certificate2(certificatePath, appSettings.CertificatePassword, X509KeyStorageFlags.Exportable);
            }
        }

        public static X509Certificate2 BuildSelfSignedServerCertificate(string certificateName, string password)
        {
            SubjectAlternativeNameBuilder sanBuilder = new SubjectAlternativeNameBuilder();
            sanBuilder.AddIpAddress(IPAddress.Loopback);
            sanBuilder.AddIpAddress(IPAddress.IPv6Loopback);
            sanBuilder.AddDnsName("localhost");

            X500DistinguishedName distinguishedName = new X500DistinguishedName($"CN={certificateName}");

            using (var rsa = RSA.Create(2048))
            {
                var request = new CertificateRequest(distinguishedName, rsa, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

                request.CertificateExtensions.Add(
                    new X509KeyUsageExtension(
                        X509KeyUsageFlags.DataEncipherment
                        | X509KeyUsageFlags.KeyEncipherment
                        | X509KeyUsageFlags.DigitalSignature
                        , false));

                request.CertificateExtensions.Add(
                   new X509EnhancedKeyUsageExtension(
                       new OidCollection { new Oid("1.3.6.1.5.5.7.3.1") }, false));

                request.CertificateExtensions.Add(sanBuilder.Build());

                var certificate = request.CreateSelfSigned(new DateTimeOffset(DateTime.UtcNow.AddDays(-1)), new DateTimeOffset(DateTime.UtcNow.AddDays(3650)));
                if (OperatingSystem.IsWindows())
                    certificate.FriendlyName = certificateName;

                var bytes = certificate.Export(X509ContentType.Pfx, password);

                return new X509Certificate2(
                    bytes,
                    password,
                    X509KeyStorageFlags.MachineKeySet |
                    X509KeyStorageFlags.PersistKeySet |
                    X509KeyStorageFlags.Exportable
                    );
            }
        }
    }
}
