//using System;
//using System.Net;
//using System.Security.Cryptography;
//using System.Security.Cryptography.X509Certificates;
//using WEB.Models;

//namespace WEB
//{
//    public static class Certificate
//    {
//        public static X509Certificate2 GetCertificate(Settings settings)
//        {
//            if (string.IsNullOrWhiteSpace(settings.CertificatePassword)) throw new ArgumentException("Missing CertificatePassword in appsettings configuration");

//            var certificatePath = settings.RootPath + "certificate.pfx";
//            if (!System.IO.File.Exists(certificatePath))
//            {
//                var certificate = BuildSelfSignedServerCertificate(settings.SiteName, settings.CertificatePassword);
//                var bytes = certificate.Export(X509ContentType.Pfx, settings.CertificatePassword);
//                System.IO.File.WriteAllBytes(certificatePath, bytes);
//                return certificate;
//            }
//            else
//            {
//                return new X509Certificate2(certificatePath, settings.CertificatePassword, X509KeyStorageFlags.Exportable);
//            }
//        }

//        public static X509Certificate2 BuildSelfSignedServerCertificate(string certificateName, string password)
//        {
//            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Missing CertificatePassword in appsettings configuration");

//            SubjectAlternativeNameBuilder sanBuilder = new SubjectAlternativeNameBuilder();
//            sanBuilder.AddIpAddress(IPAddress.Loopback);
//            sanBuilder.AddIpAddress(IPAddress.IPv6Loopback);
//            sanBuilder.AddDnsName("localhost");

//            X500DistinguishedName distinguishedName = new X500DistinguishedName($"CN={certificateName}");

//            using (var rsa = RSA.Create(2048))
//            {
//                var request = new CertificateRequest(distinguishedName, rsa, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

//                request.CertificateExtensions.Add(
//                    new X509KeyUsageExtension(
//                        X509KeyUsageFlags.DataEncipherment
//                        | X509KeyUsageFlags.KeyEncipherment
//                        | X509KeyUsageFlags.DigitalSignature
//                        , false));

//                request.CertificateExtensions.Add(
//                   new X509EnhancedKeyUsageExtension(
//                       new OidCollection { new Oid("1.3.6.1.5.5.7.3.1") }, false));

//                request.CertificateExtensions.Add(sanBuilder.Build());

//                var certificate = request.CreateSelfSigned(new DateTimeOffset(DateTime.UtcNow.AddDays(-1)), new DateTimeOffset(DateTime.UtcNow.AddDays(3650)));
//                certificate.FriendlyName = certificateName;

//                var bytes = certificate.Export(X509ContentType.Pfx, password);

//                return new X509Certificate2(
//                    bytes,
//                    password,
//                    X509KeyStorageFlags.MachineKeySet |
//                    X509KeyStorageFlags.PersistKeySet |
//                    X509KeyStorageFlags.Exportable
//                    );
//            }
//        }
//    }
//}
