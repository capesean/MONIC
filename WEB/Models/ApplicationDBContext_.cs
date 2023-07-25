using Microsoft.EntityFrameworkCore;

namespace WEB.Models
{
    public partial class ApplicationDbContext
    {
        public DbSet<Settings> Settings { get; set; }

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
