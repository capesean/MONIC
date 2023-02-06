using Microsoft.EntityFrameworkCore;

namespace WEB.Models
{
    public partial class ApplicationDbContext
    {
        public DbSet<UserTest> UserTests { get; set; }

        public void ConfigureModelBuilder(ModelBuilder modelBuilder)
        {
        }

        public void AddComputedColumns()
        {
            CreateComputedColumn("AspNetUsers", "FullName", "FirstName + ' ' + LastName");
        }

        public void AddNullableUniqueIndexes()
        {
        }
    }
}
