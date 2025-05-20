using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class OptionList
    {
        [Key, Required]
        public Guid OptionListId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string Name { get; set; }

        public virtual ICollection<Option> Options { get; set; } = new List<Option>();

        public virtual ICollection<Field> Fields { get; set; } = new List<Field>();

        public OptionList()
        {
            OptionListId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            OptionList other = (OptionList)obj;

            return OptionListId == other.OptionListId;
        }

        public override int GetHashCode()
        {
            return OptionListId.GetHashCode();
        }
    }
}
