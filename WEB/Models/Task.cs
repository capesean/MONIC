using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Task
    {
        [Key, Required]
        public Guid TaskId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        [Required]
        public Guid MilestoneId { get; set; }

        [Required, Column(TypeName = "Date")]
        public DateTime StartDate { get; set; }

        [Required, Column(TypeName = "Date")]
        public DateTime EndDate { get; set; }

        [Required, Column(TypeName = "decimal(5, 2)")]
        public decimal PercentCompleted { get; set; }

        [Column(TypeName = "Date")]
        public DateTime? CompletionDate { get; set; }

        public string Description { get; set; }

        [MaxLength(7)]
        public string Colour { get; set; }

        [ForeignKey("MilestoneId")]
        public virtual Milestone Milestone { get; set; }

        public Task()
        {
            TaskId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
