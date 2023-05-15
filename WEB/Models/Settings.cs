using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class Settings
    {
        [Key, Required]
        public Guid Id { get; set; }

        public Settings()
        {
        }
    }
}
