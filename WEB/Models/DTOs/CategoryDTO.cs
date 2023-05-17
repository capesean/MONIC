using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class CategoryDTO
    {
        [Required]
        public Guid CategoryId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(100)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(15)]
        public string Code { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual List<SubcategoryDTO> Subcategories { get; set; } = new List<SubcategoryDTO>();

    }

    public static partial class ModelFactory
    {
        public static CategoryDTO Create(Category category, bool includeParents = true, bool includeChildren = false)
        {
            if (category == null) return null;

            var categoryDTO = new CategoryDTO();

            categoryDTO.CategoryId = category.CategoryId;
            categoryDTO.Name = category.Name;
            categoryDTO.Code = category.Code;
            categoryDTO.SortOrder = category.SortOrder;

            if (includeChildren)
            {
                foreach (var subcategory in category.Subcategories)
                    categoryDTO.Subcategories.Add(Create(subcategory));
            }

            return categoryDTO;
        }

        public static void Hydrate(Category category, CategoryDTO categoryDTO)
        {
            category.Name = categoryDTO.Name;
            category.Code = categoryDTO.Code;
            category.SortOrder = categoryDTO.SortOrder;
        }
    }
}
