using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace WEB.Models
{
    public partial class ApplicationDbContext : IdentityDbContext<User, Role, Guid>
    {
        public DbSet<Error> Errors { get; set; }
        public DbSet<ErrorException> Exceptions { get; set; }

        private readonly IIdentityService identityService;
        public bool UserIsInAnyRole(params Roles[] roles) => identityService.UserIsInAnyRole(roles);
        private Settings _settings;

        public ApplicationDbContext(
            DbContextOptions options,
            IIdentityService identityService
            ) : base(options)
        {
            this.identityService = identityService;

            //ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
            ChangeTracker.AutoDetectChangesEnabled = false;
        }

        //public static ApplicationDbContext Create()
        //{
        //    return new ApplicationDbContext();
        //}

        public Settings GetDbSettings()
        {
            return _settings ??= Settings.Single();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseLazyLoadingProxies(false);
            //optionsBuilder.EnableSensitiveDataLogging();
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureModelBuilder(modelBuilder);

            modelBuilder.Entity<User>(o => o.HasMany(u => u.Roles).WithOne().HasForeignKey(ur => ur.UserId).IsRequired());

            modelBuilder.Entity<Datum>()
                .Property(o => o.Submitted)
                .Metadata
                .SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

            modelBuilder.Entity<Datum>()
                .Property(o => o.Verified)
                .Metadata
                .SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

            modelBuilder.Entity<Datum>()
                .Property(o => o.Approved)
                .Metadata
                .SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            // todo: codegenerator should produce these if specified
            modelBuilder
                    .Entity<Item>()
                    .Property(o => o.ItemType)
                    .HasConversion(new EnumToStringConverter<ItemType>());

            // set all global query filters here - use IsInRole if needed, roles retrieved using httpContextAccessor...
            //modelBuilder.Entity<XXX>(xxx => xxx.HasQueryFilter(o => identityService.GetXXX() == null || o.Xxx == identityService.GetXXX()));
        }

        private void CreateNullableUniqueIndex(string tableName, string fieldName)
        {
#pragma warning disable EF1002 // Risk of vulnerability to SQL injection.
            Database.ExecuteSqlRaw($"DROP INDEX IF EXISTS IX_{tableName}_{fieldName} ON {tableName};");
            Database.ExecuteSqlRaw($"CREATE UNIQUE NONCLUSTERED INDEX IX_{tableName}_{fieldName} ON {tableName}({fieldName}) WHERE {fieldName} IS NOT NULL;");
#pragma warning restore EF1002 // Risk of vulnerability to SQL injection.
        }

    }

    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.development.json")
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");

            var httpContextAccessor = new HttpContextAccessor();
            var identityService = new IdentityService(httpContextAccessor);

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(connectionString, opts => opts.CommandTimeout((int)TimeSpan.FromMinutes(10).TotalSeconds));
            optionsBuilder.UseOpenIddict();
            return new ApplicationDbContext(optionsBuilder.Options, identityService);
        }
    }
}