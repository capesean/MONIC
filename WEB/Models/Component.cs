using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Component
    {
        [Key, Required]
        public Guid ComponentId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(20)]
        public string Code { get; set; }

        [Required]
        public ComponentType ComponentType { get; set; }

        public string Description { get; set; }

        [MaxLength(7)]
        public string BackgroundColour { get; set; }

        [MaxLength(7)]
        public string TextColour { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Relationship> RelationshipsAsSource { get; set; } = new List<Relationship>();

        public virtual ICollection<Relationship> RelationshipsAsTarget { get; set; } = new List<Relationship>();

        public virtual ICollection<LogFrameRowComponent> LogFrameRowComponents { get; set; } = new List<LogFrameRowComponent>();

        public virtual ICollection<TheoryOfChangeComponent> TheoryOfChangeComponents { get; set; } = new List<TheoryOfChangeComponent>();

        public virtual ICollection<ComponentIndicator> ComponentIndicators { get; set; } = new List<ComponentIndicator>();

        public Component()
        {
            ComponentId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Component other = (Component)obj;

            return ComponentId == other.ComponentId;
        }

        public override int GetHashCode()
        {
            return ComponentId.GetHashCode();
        }
    }
}
