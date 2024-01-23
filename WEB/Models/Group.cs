using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Group
    {
        [Key, Required]
        public Guid GroupId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string Name { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Field> Fields { get; set; } = new List<Field>();

        public Group()
        {
            GroupId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Group other = (Group)obj;

            return GroupId == other.GroupId;
        }

        public override int GetHashCode()
        {
            return GroupId.GetHashCode();
        }
    }
}
