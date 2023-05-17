using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Settings
    {
        [Key, Required]
        public Guid Id { get; set; }

        [MaxLength(100)]
        public string ChatGPTAPIKey { get; set; }

        public Settings()
        {
            Id = Guid.Empty;
        }

        public override string ToString()
        {
            return Convert.ToString(Id);
        }
    }
}
