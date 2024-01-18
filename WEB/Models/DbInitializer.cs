using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata;

namespace WEB.Models
{
    public class DbInitializer
    {
        private AppSettings appSettings;
        private ApplicationDbContext db;
        private RoleManager<Role> rm;
        private UserManager<User> um;
        private const int errorExpiryDays = 7;

        public DbInitializer(AppSettings appSettings, ApplicationDbContext db, UserManager<User> um, RoleManager<Role> rm)
        {
            this.appSettings = appSettings;
            this.db = db;
            this.um = um;
            this.rm = rm;
        }

        public async Task InitializeAsync()
        {
            if (appSettings.IsDevelopment)
            {
                // dev option 1: drop & recreate
                //db.Database.EnsureDeleted();
                //db.Database.EnsureCreated();
                //await SeedAsync();

                // dev option 2: use migrations
                db.Database.Migrate();
            }
            else
            {
                db.Database.Migrate();
            }

            await SeedAsync();
            db.AddComputedColumns();
            db.AddNullableUniqueIndexes();

            // remove old errors so they don't bloat the database
            await DeleteErrors();

            // clean up expired/old openiddict tokens & authorizations
            await db.Database.ExecuteSqlRawAsync("delete from OpenIddictTokens where ExpirationDate < dateadd(month, -1, getdate())");
            await db.Database.ExecuteSqlRawAsync("delete from OpenIddictAuthorizations where id not in (select authorizationid from OpenIddictTokens)");
        }

        private async Task SeedAsync()
        {
            var roles = Enum.GetNames(typeof(Roles));
            foreach (var role in roles)
                if (!await rm.RoleExistsAsync(role)) await rm.CreateAsync(new Role { Name = role });

            if (!db.Settings.Any())
            {
                db.Entry(new Settings { Id = Guid.Empty }).State = EntityState.Added;
                await db.SaveChangesAsync();
            }
        }

        private async Task DeleteErrors()
        {
            var cutoff = DateTime.Now.AddDays(-errorExpiryDays);
            foreach (var error in db.Errors.Where(o => o.DateUtc < cutoff).ToList())
            {
                db.Entry(error).State = EntityState.Deleted;
                Guid? exceptionId = error.ExceptionId;
                while (exceptionId != null)
                {
                    var exception = await db.Exceptions.FirstAsync(o => o.Id == exceptionId);
                    db.Entry(exception).State = EntityState.Deleted;
                    exceptionId = exception.InnerExceptionId;
                }
            }
            await db.SaveChangesAsync();
        }
    }
}