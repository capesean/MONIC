using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Milestone
    {
        [Key, Required]
        public Guid MilestoneId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        [Required]
        public Guid ProjectId { get; set; }

        public string Description { get; set; }

        [MaxLength(7)]
        public string Colour { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        public Milestone()
        {
            MilestoneId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
