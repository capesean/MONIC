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
        public bool UseSubmit { get; set; }

        [Required]
        public bool UseVerify { get; set; }

        [Required]
        public bool UseApprove { get; set; }

        [Required]
        public bool UseReject { get; set; }

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
