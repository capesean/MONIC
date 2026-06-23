using Azure.Identity;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Monic.Web.Models;
using static OpenIddict.Abstractions.OpenIddictConstants;
using Monic.Web.Code;
using Monic.Web.Services;

var builder = WebApplication.CreateBuilder(args);

/**********************************************
 * on azure, the app should typically have a key vault with:
 * - a key for encrypting data protection keys
 * - secrets for storing sensitive configuration values (e.g. database connection string, email credentials, etc)
 * - a certificate for signing tokens 
 *   - (this is actually added under the app certificates - using upload on the 'bring your own' option - see the certificate generation code in certificate.cs)
 *   - this requires the app to have an env settings of "WEBSITE_LOAD_CERTIFICATES" with a value of the thumbprint of the certificate
 * the app should probably have the following permissions to the key vault:
 * - Key Vault Crypto User
 * - Key Vaults Secrets User
 * - Key Vault Certificate User 
 * also, the storage container that has the data protection keys should have the Storage Blob Data Contributor role assigned for the app
 **********************************************/

if (!builder.Environment.IsDevelopment())
{
    // this is the key vault uri for data protection keys
    builder.Configuration.AddAzureKeyVault(
        new Uri(builder.Configuration["KeyVault:VaultUri"]),
        new DefaultAzureCredential());
}

var appSettings = builder.Configuration.GetSection("Settings").Get<AppSettings>();

if (!builder.Environment.IsDevelopment())
{
    var credential = new DefaultAzureCredential();

    await General.EnsureDataProtectionBlobIsHotAsync(
        appSettings.Azure.DataProtection.BlobUri,
        credential);

    // ensure the app has managed identity enabled, and has:
    // - access to the blob storage container for data protection keys (Storage Blob Data Contributor role)
    // - access to the key vault for data protection keys (Key Vault Crypto User role)
    builder.Services.AddDataProtection()
        .SetApplicationName("MONIC")
        .PersistKeysToAzureBlobStorage(
            new Uri(appSettings.Azure.DataProtection.BlobUri),
            credential)
        .ProtectKeysWithAzureKeyVault(
            new Uri(appSettings.Azure.DataProtection.KeyIdentifier),
            credential);
}
else
{
    builder.Services.AddDataProtection()
        .SetApplicationName("MONIC");
}

appSettings.RootPath = builder.Environment.ContentRootPath;
if (builder.Environment.IsDevelopment())
    appSettings.WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp\\src\\");
else
    appSettings.WebRootPath = builder.Environment.WebRootPath;
appSettings.Email.WebRootPath = builder.Environment.WebRootPath;

//builder.Services.AddControllers(options => options.Filters.Add(typeof(ApiExceptionAttribute)))
builder.Services.AddControllersWithViews(options => options.Filters.Add(typeof(ApiExceptionAttribute)))
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new DateTimeConverter()));

/* 
 * running the SPA separately from the backend:
 * the `start-angular.bat` file will run `npm start`, which will use the package.json config to run `ng serve` on the specified port
 * that port will have CORS issues if attempting to interact with the api on the port configured in Properties folder -> launchsettings.json
 * so configure development CORS policy to allow CORS for this domain/port
 */

// from: https://medium.com/@saravananganesan/how-to-breaking-asp-net-core-with-angular-project-into-frontend-and-backend-a3b3fd084b25
var policyName = "_allowSpecificOrigins";
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: policyName, builder =>
        {
            // must match with the port in package.json -> scripts:start (also: appSettings.RootUrl - i.e. the front-end address)
            // and SpaProxyServerUrl in Web.csproj
            builder.WithOrigins("https://localhost:44410");
            builder.AllowAnyMethod();
            builder.AllowAnyHeader();
            builder.AllowCredentials();
            builder.WithExposedHeaders("X-Pagination", "Content-Disposition");
        });
    });
}

builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, optionsBuilder) =>
{
    optionsBuilder.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.CommandTimeout(300);
            sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        });

    optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    optionsBuilder.UseOpenIddict();
});

builder.Services.AddDbContextFactory<ApplicationDbContext>(optionsBuilder =>
{
    optionsBuilder.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.CommandTimeout(300);
            sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        }
    );

    //if (builder.Environment.IsDevelopment()) optionsBuilder.EnableSensitiveDataLogging();
    optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    optionsBuilder.UseOpenIddict();

}, ServiceLifetime.Scoped);

builder.Services.AddIdentity<User, Role>(options =>
{
    options.User.AllowedUserNameCharacters += "'";
})
    .AddUserManager<UserManager<User>>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// configure identity options (includes JWT claims)
builder.Services.Configure<IdentityOptions>(options =>
{
    options.User.RequireUniqueEmail = true;

    options.ClaimsIdentity.UserNameClaimType = Claims.Name;
    options.ClaimsIdentity.UserIdClaimType = Claims.Subject;
    options.ClaimsIdentity.RoleClaimType = Claims.Role;

    if (builder.Environment.IsDevelopment())
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 3;
    }
    else
    {
        // todo: in settings
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
    }
});

builder.ConfigureOpenIddict(appSettings);

builder.Services.AddSingleton(appSettings);
builder.Services.AddSingleton(appSettings.Email);
builder.Services.AddSingleton(appSettings.Azure.Documents);
builder.Services.AddSingleton<IEmailService, EmailService>();

var app = builder.Build();

using (var scope = app.Services.GetRequiredService<IServiceScopeFactory>().CreateScope())
using (var db = scope.ServiceProvider.GetService<ApplicationDbContext>())
using (var um = scope.ServiceProvider.GetService<UserManager<User>>())
using (var rm = scope.ServiceProvider.GetService<RoleManager<Role>>())
{
    // initialise, seed, etc
    var initializer = new DbInitializer(appSettings, db, um, rm, builder.Environment);
    await initializer.InitializeAsync();
}

// allows rewinding of request body for error logging
app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();
    await next();
});

if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

if (builder.Environment.IsDevelopment())
{
    app.UseCors(policyName);
    //app.UseCors(x => x
    //         .AllowAnyOrigin()
    //         .AllowAnyMethod()
    //         .AllowAnyHeader());
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
//app.UseEndpoints(endpoints => endpoints.MapControllers());

app.MapFallbackToFile("index.html");

app.Run();

