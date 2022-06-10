using WEB.Models;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace WEB
{
    public static class OpenIddictExtensions
    {
        public static void ConfigureOpenIddict(this WebApplicationBuilder builder, Settings settings)
        {
            builder.Services
                .AddOpenIddict()

                // Register the OpenIddict core services.
                .AddCore(options =>
                {
                    // Register the Entity Framework stores and models.
                    options.UseEntityFrameworkCore()
                            .UseDbContext<ApplicationDbContext>();
                })

                // Register the OpenIddict server handler.
                .AddServer(options =>
                {
                    options.SetLogoutEndpointUris("/connect/logout")
                            .SetTokenEndpointUris("/connect/token");

                    // Enable the flows
                    options.AllowPasswordFlow()
                            .AllowRefreshTokenFlow();

                    options.RegisterScopes(Scopes.Profile, Scopes.Roles);

                    options.SetAccessTokenLifetime(TimeSpan.FromMinutes(settings.AccessTokenExpiryMinutes));
                    options.SetRefreshTokenLifetime(TimeSpan.FromMinutes(settings.RefreshTokenExpiryMinutes));

                    // register the signing and encryption credentials.
                    if (settings.IsDevelopment)
                    {
                        // can also use options.AddEphemeralEncryptionKey().AddEphemeralSigningKey();
                        options.AddDevelopmentEncryptionCertificate()
                                .AddDevelopmentSigningCertificate();
                    }
                    //else
                    //{
                    //    var certificate = Certificate.GetCertificate(settings);
                    //    options.AddEncryptionCertificate(certificate);
                    //    options.AddSigningCertificate(certificate);
                    //}

                    // Force client applications to use Proof Key for Code Exchange (PKCE).
                    options.RequireProofKeyForCodeExchange();

                    options.UseAspNetCore()
                        .EnableTokenEndpointPassthrough()
                        //.DisableTransportSecurityRequirement()
                        ;

                    // Note: if you don't want to specify a client_id when sending
                    // a token or revocation request, uncomment the following line:
                    //
                    options.AcceptAnonymousClients();

                    // Note: if you want to process authorization and token requests
                    // that specify non-registered scopes, uncomment the following line:
                    //
                    options.DisableScopeValidation();

                    // Note: if you don't want to use permissions, you can disable
                    // permission enforcement by uncommenting the following lines:
                    //
                    options.IgnoreEndpointPermissions()
                            .IgnoreGrantTypePermissions()
                            .IgnoreResponseTypePermissions()
                            .IgnoreScopePermissions();

                    // Note: when issuing access tokens used by third-party APIs
                    // you don't own, you can disable access token encryption:
                    //
                    // options.DisableAccessTokenEncryption();
                })

                // Register the OpenIddict validation components.
                .AddValidation(options =>
                {
                    // Configure the audience accepted by this resource server.
                    // The value MUST match the audience associated with the
                    // "demo_api" scope, which is used by ResourceController.
                    //options.AddAudiences("resource_server");

                    // Import the configuration from the local OpenIddict server instance.
                    options.UseLocalServer();

                    // Register the ASP.NET Core host.
                    options.UseAspNetCore();

                    // For applications that need immediate access token or authorization
                    // revocation, the database entry of the received tokens and their
                    // associated authorizations can be validated for each API call.
                    // Enabling these options may have a negative impact on performance.
                    //
                    // options.EnableAuthorizationEntryValidation();
                    // options.EnableTokenEntryValidation();
                });

            builder.Services.ConfigureApplicationCookie(config =>
            {
                config.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = 403;
                    return Task.CompletedTask;
                };
                config.Events.OnRedirectToLogin = context =>
                {
                    // redirect to /auth/login here?
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };

            });
        }
    }
}
