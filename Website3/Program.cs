using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WEB;
using WEB.Error;
using WEB.Models;
using static OpenIddict.Abstractions.OpenIddictConstants;

var builder = WebApplication.CreateBuilder(args);

var settings = builder.Configuration.GetSection("Settings").Get<Settings>();
DbContextOptions dbContextOptions = null;

//settings.RootPath = Environment.ContentRootPath + (Environment.ContentRootPath.EndsWith(@"\") ? "" : @"\");

//builder.Services.AddControllers(options => options.Filters.Add(typeof(ApiExceptionAttribute)))
builder.Services.AddControllersWithViews(options => options.Filters.Add(typeof(ApiExceptionAttribute)))
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new DateTimeConverter()));


builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        // Configure the context to use Microsoft SQL Server.
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions => sqlOptions.CommandTimeout(300));

        options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);

        // Register the entity sets needed by OpenIddict.
        // Note: use the generic overload if you need
        // to replace the default OpenIddict entities.
        options.UseOpenIddict();

        //builder.Services.AddSingleton(options.Options);

        // store for init
        dbContextOptions = options.Options;
    });

builder.Services
    .AddIdentity<User, AppRole>()
    .AddUserManager<UserManager<User>>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

// configure identity options (includes JWT claims)
builder.Services.Configure<IdentityOptions>(options =>
{
    options.User.RequireUniqueEmail = true;

    options.ClaimsIdentity.UserNameClaimType = Claims.Name;
    options.ClaimsIdentity.UserIdClaimType = Claims.Subject;
    options.ClaimsIdentity.RoleClaimType = Claims.Role;

    if (settings.IsDevelopment)
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

builder.ConfigureOpenIddict(settings);

builder.Services.AddSingleton(settings);
builder.Services.AddSingleton<IEmailSender, EmailSender>();

var app = builder.Build();

using (var scope = app.Services.GetRequiredService<IServiceScopeFactory>().CreateScope())
using (var db = scope.ServiceProvider.GetService<ApplicationDbContext>())
using (var um = scope.ServiceProvider.GetService<UserManager<User>>())
using (var rm = scope.ServiceProvider.GetService<RoleManager<AppRole>>())
{
    // initialise, seed, etc
    var initializer = new DbInitializer(settings, db, um, rm);
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

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints => endpoints.MapControllers());

app.MapFallbackToFile("index.html"); ;

app.Run();


