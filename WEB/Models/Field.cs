using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Field
    {
        [Key, Required]
        public Guid FieldId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(2000)]
        public string Name { get; set; }

        [Required]
        public FieldType FieldType { get; set; }

        [Required]
        public bool Organisation { get; set; }

        [Required]
        public bool Entity { get; set; }

        [Required]
        public bool Indicator { get; set; }

        [Required]
        public bool Component { get; set; }

        [Required]
        public bool Relationship { get; set; }

        [Required]
        public bool Folder { get; set; }

        [Required]
        public bool Required { get; set; }

        [Required]
        public bool IsUnique { get; set; }

        [Required]
        public Size Size { get; set; }

        public short? MinLength { get; set; }

        public short? MaxLength { get; set; }

        [MaxLength(250)]
        public string RegEx { get; set; }

        [Required]
        public int SortOrder { get; set; }

        [Required]
        public bool Multiple { get; set; }

        [Required]
        public bool RadioCheckbox { get; set; }

        [Required]
        public bool MultiLine { get; set; }

        public Guid? GroupId { get; set; }

        [Required]
        public short Rows { get; set; }

        public virtual ICollection<Option> Options { get; set; } = new List<Option>();

        public virtual ICollection<FieldValue> FieldValues { get; set; } = new List<FieldValue>();

        [ForeignKey("GroupId")]
        public virtual Group Group { get; set; }

        public Field()
        {
            FieldId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Field other = (Field)obj;

            return FieldId == other.FieldId;
        }

        public override int GetHashCode()
        {
            return FieldId.GetHashCode();
        }
    }
}
