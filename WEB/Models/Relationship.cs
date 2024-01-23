using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Relationship
    {
        [Key, Required]
        public Guid RelationshipId { get; set; }

        [Required]
        public Guid TheoryOfChangeId { get; set; }

        [Required]
        public Guid SourceComponentId { get; set; }

        [Required]
        public Guid TargetComponentId { get; set; }

        [MaxLength(50)]
        public string Label { get; set; }

        [ForeignKey("SourceComponentId")]
        public virtual Component SourceComponent { get; set; }

        [ForeignKey("TargetComponentId")]
        public virtual Component TargetComponent { get; set; }

        [ForeignKey("TheoryOfChangeId")]
        public virtual TheoryOfChange TheoryOfChange { get; set; }

        public Relationship()
        {
            RelationshipId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(TargetComponentId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Relationship other = (Relationship)obj;

            return RelationshipId == other.RelationshipId;
        }

        public override int GetHashCode()
        {
            return RelationshipId.GetHashCode();
        }
    }
}
