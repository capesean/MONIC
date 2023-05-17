using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Subcategory
    {
        [Key, Required]
        public Guid SubcategoryId { get; set; }

        [Required]
        public Guid CategoryId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(100)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(15)]
        public string Code { get; set; }

        [Required]
        public bool DataEntrySubtotal { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Indicator> Indicators { get; set; } = new List<Indicator>();

        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; }

        public Subcategory()
        {
            SubcategoryId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
