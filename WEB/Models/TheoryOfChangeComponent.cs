using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class TheoryOfChangeComponent
    {
        [Required]
        public Guid TheoryOfChangeId { get; set; }

        [Required]
        public Guid ComponentId { get; set; }

        [ForeignKey("ComponentId")]
        public virtual Component Component { get; set; }

        [ForeignKey("TheoryOfChangeId")]
        public virtual TheoryOfChange TheoryOfChange { get; set; }

        public TheoryOfChangeComponent()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(ComponentId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            TheoryOfChangeComponent other = (TheoryOfChangeComponent)obj;

            return TheoryOfChangeId == other.TheoryOfChangeId && ComponentId == other.ComponentId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + TheoryOfChangeId.GetHashCode();
            hash = hash * 23 + ComponentId.GetHashCode();
            return hash;
        }
    }
}
