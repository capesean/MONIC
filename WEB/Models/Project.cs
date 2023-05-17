using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Project
    {
        [Key, Required]
        public Guid ProjectId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        [MaxLength(7)]
        public string Colour { get; set; }

        public virtual ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();

        public Project()
        {
            ProjectId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
