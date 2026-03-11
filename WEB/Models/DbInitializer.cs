using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata;

namespace WEB.Models
{
    public class DbInitializer
    {
        private readonly AppSettings appSettings;
        private readonly ApplicationDbContext db;
        private readonly RoleManager<Role> rm;
        private readonly UserManager<User> um;
        private const int errorExpiryDays = 7;
        private readonly IHostEnvironment environment;

        public DbInitializer(AppSettings appSettings, ApplicationDbContext db, UserManager<User> um, RoleManager<Role> rm, IHostEnvironment environment)
        {
            this.appSettings = appSettings;
            this.db = db;
            this.um = um;
            this.rm = rm;
            this.environment = environment;
        }

        public async System.Threading.Tasks.Task InitializeAsync()
        {
            if (environment.IsDevelopment())
            {
                // dev option 1: drop & recreate
                //db.Database.EnsureDeleted();
                //db.Database.EnsureCreated();

                // dev option 2: use migrations
                db.Database.Migrate();
            }
            else
            {
                db.Database.Migrate();
            }

            await SeedAsync();
            await CreateRolesAsync();

            db.AddNullableUniqueIndexes();

            // remove old errors so they don't bloat the database
            await DeleteErrors();

            // clean up expired/old openiddict tokens & authorizations
            await db.Database.ExecuteSqlRawAsync("delete from OpenIddictTokens where (ExpirationDate < getdate() or Status = 'Redeemed')");
            await db.Database.ExecuteSqlRawAsync("delete from OpenIddictAuthorizations where id not in (select authorizationid from OpenIddictTokens)");
        }

        private async System.Threading.Tasks.Task SeedAsync()
        {
            if (!db.Settings.Any())
            {
                db.Entry(new Settings { Id = Guid.Empty }).State = EntityState.Added;
                await db.SaveChangesAsync();
            }
        }

        private async System.Threading.Tasks.Task CreateRolesAsync()
        {
            var roles = Enum.GetNames(typeof(Roles));
            foreach (var role in roles)
                if (!await rm.RoleExistsAsync(role)) await rm.CreateAsync(new Role { Name = role });
        }

        private async System.Threading.Tasks.Task DeleteErrors()
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