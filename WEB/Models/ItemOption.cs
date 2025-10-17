using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class ItemOption
    {
        [Required]
        public Guid ItemId { get; set; }

        [Required]
        public Guid FieldId { get; set; }

        [Required]
        public Guid OptionId { get; set; }

        [ForeignKey("FieldId")]
        public virtual Field Field { get; set; }

        [ForeignKey("ItemId")]
        public virtual Item Item { get; set; }

        [ForeignKey("OptionId")]
        public virtual Option Option { get; set; }

        public ItemOption()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(OptionId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            ItemOption other = (ItemOption)obj;

            return ItemId == other.ItemId && FieldId == other.FieldId && OptionId == other.OptionId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + ItemId.GetHashCode();
            hash = hash * 23 + FieldId.GetHashCode();
            hash = hash * 23 + OptionId.GetHashCode();
            return hash;
        }
    }
}
