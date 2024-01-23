using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Category
    {
        [Key, Required]
        public Guid CategoryId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(100)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(15)]
        public string Code { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Subcategory> Subcategories { get; set; } = new List<Subcategory>();

        public Category()
        {
            CategoryId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Category other = (Category)obj;

            return CategoryId == other.CategoryId;
        }

        public override int GetHashCode()
        {
            return CategoryId.GetHashCode();
        }
    }
}
