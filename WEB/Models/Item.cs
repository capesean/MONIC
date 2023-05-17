using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Item
    {
        [Key, Required]
        public Guid ItemId { get; set; }

        [Required]
        public ItemType ItemType { get; set; }

        public virtual ICollection<FieldValue> FieldValues { get; set; } = new List<FieldValue>();

        public virtual ICollection<OptionValue> OptionValues { get; set; } = new List<OptionValue>();

        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

        public Item()
        {
            ItemId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(ItemId);
        }
    }
}
