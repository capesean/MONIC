using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class TheoryOfChange
    {
        [Key, Required]
        public Guid TheoryOfChangeId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        public virtual ICollection<TheoryOfChangeComponent> TheoryOfChangeComponents { get; set; } = new List<TheoryOfChangeComponent>();

        public virtual ICollection<Relationship> Relationships { get; set; } = new List<Relationship>();

        public TheoryOfChange()
        {
            TheoryOfChangeId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            TheoryOfChange other = (TheoryOfChange)obj;

            return TheoryOfChangeId == other.TheoryOfChangeId;
        }

        public override int GetHashCode()
        {
            return TheoryOfChangeId.GetHashCode();
        }
    }
}
