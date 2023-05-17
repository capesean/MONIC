using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Entity
    {
        [Key, Required]
        public Guid EntityId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(200)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(25)]
        public string Code { get; set; }

        [Required]
        public Guid EntityTypeId { get; set; }

        public Guid? OrganisationId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string ShortName { get; set; }

        [Required]
        public bool Disabled { get; set; }

        public virtual ICollection<Datum> Data { get; set; } = new List<Datum>();

        public virtual ICollection<EntityPermission> EntityPermissions { get; set; } = new List<EntityPermission>();

        public virtual ICollection<EntityLink> ParentEntities { get; set; } = new List<EntityLink>();

        public virtual ICollection<EntityLink> ChildEntities { get; set; } = new List<EntityLink>();

        public virtual ICollection<User> AffiliatedUsers { get; set; } = new List<User>();

        public virtual ICollection<Response> Responses { get; set; } = new List<Response>();

        [ForeignKey("EntityTypeId")]
        public virtual EntityType EntityType { get; set; }

        [ForeignKey("OrganisationId")]
        public virtual Organisation Organisation { get; set; }

        public Entity()
        {
            EntityId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
