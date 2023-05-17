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
    }
}
