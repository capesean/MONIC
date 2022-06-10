using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class DbSettings
    {
        [Key, Required]
        public Guid Id { get; set; }

        public DbSettings()
        {
            Id = Guid.Empty;
        }
    }
}
