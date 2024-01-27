using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace WEB.Models
{
    public partial class ApplicationDbContext : IdentityDbContext<User, Role, Guid>
    {
        public DbSet<Error> Errors { get; set; }
        public DbSet<ErrorException> Exceptions { get; set; }

        public ApplicationDbContext()
        {
            // disabling tracking entirely messes up openiddict's sign-in behaviour: https://github.com/openiddict/openiddict-core/issues/565
            // could this be handled by having two types of dbcontext initialized? one with tracking, the other without?
            // ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
            ChangeTracker.AutoDetectChangesEnabled = false;
        }

        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
            //ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
            ChangeTracker.AutoDetectChangesEnabled = false;
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
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

            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }

        private void CreateNullableUniqueIndex(string tableName, string fieldName)
        {
            Database.ExecuteSqlRaw($"DROP INDEX IF EXISTS IX_{tableName}_{fieldName} ON {tableName};");
            Database.ExecuteSqlRaw($"CREATE UNIQUE NONCLUSTERED INDEX IX_{tableName}_{fieldName} ON {tableName}({fieldName}) WHERE {fieldName} IS NOT NULL;");
        }

    }
}