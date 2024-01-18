using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Settings
    {
        [Key, Required]
        public Guid Id { get; set; }

        [Required]
        public bool SetupCompleted { get; set; }

        public Settings()
        {
            Id = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(Id);
        }
    }
}
