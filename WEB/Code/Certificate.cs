using System.Net;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using Monic.Web.Models;

namespace Monic.Web.Code
{
    public static class CertificateHelper
    {
        public static X509Certificate2 GetKeyVaultCertificate(string thumbprint)
        {
            // ensure azure app has environment variable: WEBSITE_LOAD_CERTIFICATES = {THUMBPRINT}
            // where {THUMBPRINT} is the thumbprint of the certificate uploaded to azure app service
            // add a certificate (use the 'bring your own' option) and use the thumbprint from that screen. 
            // powershell code for generating as openiddict.pfx on desktop:
            /*************************************************************
            $pwd = ConvertTo-SecureString "---PUTYOURSTRONGPASSWORDHERE---" -AsPlainText -Force

            $cert = New-SelfSignedCertificate `
              -Subject "CN=openiddict" `
              -CertStoreLocation "cert:\CurrentUser\My" `
              -KeyAlgorithm RSA `
              -KeyLength 2048 `
              -KeyExportPolicy Exportable `
              -NotAfter (Get-Date).AddYears(5) `
              -FriendlyName "OpenIddict"

            Export-PfxCertificate `
              -Cert "cert:\CurrentUser\My\$($cert.Thumbprint)" `
              -FilePath "$env:USERPROFILE\Desktop\openiddict.pfx" `
              -Password $pwd
            *************************************************************/
            using var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
            store.Open(OpenFlags.ReadOnly);

            var certificates = store.Certificates.Find(
                X509FindType.FindByThumbprint,
                thumbprint,
                validOnly: false);

            var certificate = certificates.OfType<X509Certificate2>().FirstOrDefault();

            if (certificate == null)
                throw new Exception($"Certificate not found. Thumbprint: {thumbprint}");

            return certificate;
        }

        public static X509Certificate2 GetLocalCertificate(AppSettings appSettings)
        {
            var certificatePath = Path.Combine(appSettings.RootPath, "certificate.pfx");

            if (!File.Exists(certificatePath))
            {
                var certificate = BuildSelfSignedServerCertificate(appSettings.SiteName, appSettings.CertificatePassword);
                var bytes = certificate.Export(X509ContentType.Pfx, appSettings.CertificatePassword);
                File.WriteAllBytes(certificatePath, bytes);
                return certificate;
            }

            return X509CertificateLoader.LoadPkcs12FromFile(
                certificatePath,
                appSettings.CertificatePassword,
                X509KeyStorageFlags.MachineKeySet |
                X509KeyStorageFlags.PersistKeySet |
                X509KeyStorageFlags.Exportable);
        }

        public static X509Certificate2 BuildSelfSignedServerCertificate(string certificateName, string password)
        {
            var sanBuilder = new SubjectAlternativeNameBuilder();
            sanBuilder.AddIpAddress(IPAddress.Loopback);
            sanBuilder.AddIpAddress(IPAddress.IPv6Loopback);
            sanBuilder.AddDnsName("localhost");

            var distinguishedName = new X500DistinguishedName($"CN={certificateName}");

            using var rsa = RSA.Create(2048);

            var request = new CertificateRequest(
                distinguishedName,
                rsa,
                HashAlgorithmName.SHA256,
                RSASignaturePadding.Pkcs1);

            request.CertificateExtensions.Add(
                new X509KeyUsageExtension(
                    X509KeyUsageFlags.DataEncipherment |
                    X509KeyUsageFlags.KeyEncipherment |
                    X509KeyUsageFlags.DigitalSignature,
                    false));

            request.CertificateExtensions.Add(
                new X509EnhancedKeyUsageExtension(
                    new OidCollection { new Oid("1.3.6.1.5.5.7.3.1") },
                    false));

            request.CertificateExtensions.Add(sanBuilder.Build());

            var certificate = request.CreateSelfSigned(
                DateTimeOffset.UtcNow.AddDays(-1),
                DateTimeOffset.UtcNow.AddDays(3650));

            var bytes = certificate.Export(X509ContentType.Pfx, password);

            return X509CertificateLoader.LoadPkcs12(
                bytes,
                password,
                X509KeyStorageFlags.MachineKeySet |
                X509KeyStorageFlags.PersistKeySet |
                X509KeyStorageFlags.Exportable);
        }

        public static string GetEncryptionCertificatePath(AppSettings appSettings) =>
            Path.Combine(appSettings.RootPath, "encryption-certificate.pfx");

        public static string GetSigningCertificatePath(AppSettings appSettings) =>
            Path.Combine(appSettings.RootPath, "signing-certificate.pfx");

        public static void CreateEncryptionCertificate(AppSettings appSettings)
        {
            using var algorithm = RSA.Create(2048);

            var subject = new X500DistinguishedName("CN=Fabrikam Encryption Certificate");
            var request = new CertificateRequest(subject, algorithm, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
            request.CertificateExtensions.Add(
                new X509KeyUsageExtension(X509KeyUsageFlags.KeyEncipherment, critical: true));

            var certificate = request.CreateSelfSigned(
                DateTimeOffset.UtcNow,
                DateTimeOffset.UtcNow.AddYears(2));

            File.WriteAllBytes(
                GetEncryptionCertificatePath(appSettings),
                certificate.Export(X509ContentType.Pfx, appSettings.CertificatePassword));
        }

        public static void CreateSigningCertificate(AppSettings appSettings)
        {
            using var algorithm = RSA.Create(2048);

            var subject = new X500DistinguishedName("CN=Fabrikam Signing Certificate");
            var request = new CertificateRequest(subject, algorithm, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
            request.CertificateExtensions.Add(
                new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, critical: true));

            var certificate = request.CreateSelfSigned(
                DateTimeOffset.UtcNow,
                DateTimeOffset.UtcNow.AddYears(2));

            File.WriteAllBytes(
                GetSigningCertificatePath(appSettings),
                certificate.Export(X509ContentType.Pfx, appSettings.CertificatePassword));
        }
    }
}