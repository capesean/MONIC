using Azure.Identity;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WEB;
using WEB.Error;
using WEB.Models;
using static OpenIddict.Abstractions.OpenIddictConstants;

var builder = WebApplication.CreateBuilder(args);

var appSettings = builder.Configuration.GetSection("Settings").Get<AppSettings>();

if (appSettings.UseAzureDataProtection)
{
    // use azure blob storage to persist the data protection keys, so the decryption of JWTs works after restarting the app (e.g. publishing)

    /*
     * The requires a storage account, container & blob created on Azure - for the blob storage url
     * -> The URL is in the format: https://[storage-account].blob.core.windows.net/[container]/[filename].xml 
     * -> filename can be something like "dataprotectionkeys" - it will be created on first run
     * It also requires an app registration on Entra Id (formerly Azure Active Directory) for the tenantId, clientId and secret
     * The app registration also needs to be added to the container's access Control (IAM) with role: Storage Blob Data Contributor
     */

    builder.Services.AddDataProtection()
                .PersistKeysToAzureBlobStorage(appSettings.Azure.DataProtection.ConnectionString, appSettings.Azure.DataProtection.ContainerName, "dataprotectionkeys.xml");
}

// todo: this is not correct - find out a better way to get correct path
appSettings.WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), appSettings.IsDevelopment ? "ClientApp\\src\\" : "wwwroot\\");
appSettings.RootPath = Path.Combine(Directory.GetCurrentDirectory());

builder.Services.AddScoped<ApiExceptionAttribute>();

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
var policyName = "_dashboard";
if (appSettings.IsDevelopment)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: policyName, builder =>
        {
            // must match with the port in package.json -> scripts:start (also: appSettings.RootUrl - i.e. the front-end address)
            // and SpaProxyServerUrl in WEB.csproj
            builder.WithOrigins("https://localhost:44410", "http://localhost:49823");
            builder.AllowAnyMethod();
            builder.AllowAnyHeader();
            builder.WithExposedHeaders("X-Pagination", "Content-Disposition");
        });
    });
}
else
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: policyName, builder =>
        {
            builder.WithOrigins("https://uhc2030dashboard.monic.tech");
            builder.WithMethods("GET", "HEAD");
        });
    });
}

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IIdentityService, IdentityService>();

builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.CommandTimeout(300);
            sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        });

    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    options.UseOpenIddict();
});

builder.Services.AddDbContextFactory<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.CommandTimeout(300);
            sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        }
    );

    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);

    options.UseOpenIddict();

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

    if (appSettings.IsDevelopment)
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
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
builder.Services.AddSingleton<IEmailSender, EmailSender>();

var app = builder.Build();

using (var scope = app.Services.GetRequiredService<IServiceScopeFactory>().CreateScope())
using (var db = scope.ServiceProvider.GetService<ApplicationDbContext>())
using (var um = scope.ServiceProvider.GetService<UserManager<User>>())
using (var rm = scope.ServiceProvider.GetService<RoleManager<Role>>())
{
    // initialise, seed, etc
    var initializer = new DbInitializer(appSettings, db, um, rm);
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

app.UseCors(policyName);

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
//app.UseEndpoints(endpoints => endpoints.MapControllers());

app.MapFallbackToFile("index.html");

app.Run();
