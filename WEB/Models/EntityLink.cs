using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class EntityLink
    {
        [Required]
        public Guid ChildEntityId { get; set; }

        [Required]
        public Guid ParentEntityId { get; set; }

        [ForeignKey("ParentEntityId")]
        public virtual Entity ParentEntity { get; set; }

        [ForeignKey("ChildEntityId")]
        public virtual Entity ChildEntity { get; set; }

        public EntityLink()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(ChildEntityId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            EntityLink other = (EntityLink)obj;

            return ChildEntityId == other.ChildEntityId && ParentEntityId == other.ParentEntityId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + ChildEntityId.GetHashCode();
            hash = hash * 23 + ParentEntityId.GetHashCode();
            return hash;
        }
    }
}
