using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Organisation
    {
        [Key, Required]
        public Guid OrganisationId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(100)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(10)]
        public string Code { get; set; }

        public virtual ICollection<Entity> Entities { get; set; } = new List<Entity>();

        public virtual ICollection<User> Users { get; set; } = new List<User>();

        public Organisation()
        {
            OrganisationId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
