using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class EntityType
    {
        [Key, Required]
        public Guid EntityTypeId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string Plural { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Entity> Entities { get; set; } = new List<Entity>();

        public virtual ICollection<Indicator> Indicators { get; set; } = new List<Indicator>();

        public virtual ICollection<Questionnaire> Questionnaires { get; set; } = new List<Questionnaire>();

        public EntityType()
        {
            EntityTypeId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
