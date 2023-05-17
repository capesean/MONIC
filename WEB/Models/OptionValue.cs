using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class OptionValue
    {
        [Required]
        public Guid ItemId { get; set; }

        [Required]
        public Guid OptionId { get; set; }

        [ForeignKey("ItemId")]
        public virtual Item Item { get; set; }

        [ForeignKey("OptionId")]
        public virtual Option Option { get; set; }

        public OptionValue()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(OptionId);
        }
    }
}
