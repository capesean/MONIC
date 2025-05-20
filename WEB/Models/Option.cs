using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Option
    {
        [Key, Required]
        public Guid OptionId { get; set; }

        [Required]
        public Guid FieldId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(2000)]
        public string Name { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<ItemOption> ItemOptions { get; set; } = new List<ItemOption>();

        [ForeignKey("FieldId")]
        public virtual Field Field { get; set; }

        public Option()
        {
            OptionId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Option other = (Option)obj;

            return OptionId == other.OptionId;
        }

        public override int GetHashCode()
        {
            return OptionId.GetHashCode();
        }
    }
}
