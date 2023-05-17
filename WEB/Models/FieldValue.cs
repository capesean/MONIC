using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class FieldValue
    {
        [Required]
        public Guid ItemId { get; set; }

        [Required]
        public Guid FieldId { get; set; }

        public string Value { get; set; }

        [ForeignKey("FieldId")]
        public virtual Field Field { get; set; }

        [ForeignKey("ItemId")]
        public virtual Item Item { get; set; }

        public FieldValue()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(FieldId);
        }
    }
}
