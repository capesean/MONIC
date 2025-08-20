using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class SubcategoryDTO : FieldsDTO
    {
        [Required]
        public Guid SubcategoryId { get; set; }

        [Required]
        public Guid CategoryId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(100)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(15)]
        public string Code { get; set; }

        [Required]
        public bool DataEntrySubtotal { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public CategoryDTO Category { get; set; }

        public virtual List<IndicatorDTO> Indicators { get; set; } = new List<IndicatorDTO>();

    }

    public static partial class ModelFactory
    {
        public static SubcategoryDTO Create(Subcategory subcategory, bool includeParents = true, bool includeChildren = false, Item item = null)
        {
            if (subcategory == null) return null;

            var subcategoryDTO = new SubcategoryDTO();

            subcategoryDTO.SubcategoryId = subcategory.SubcategoryId;
            subcategoryDTO.CategoryId = subcategory.CategoryId;
            subcategoryDTO.Name = subcategory.Name;
            subcategoryDTO.Code = subcategory.Code;
            subcategoryDTO.DataEntrySubtotal = subcategory.DataEntrySubtotal;
            subcategoryDTO.SortOrder = subcategory.SortOrder;

            if (includeParents)
            {
                subcategoryDTO.Category = Create(subcategory.Category);
            }

            if (includeChildren)
            {
                foreach (var indicator in subcategory.Indicators)
                    subcategoryDTO.Indicators.Add(Create(indicator));
            }

            subcategoryDTO.AddFields(item);

            return subcategoryDTO;
        }

        public static void Hydrate(Subcategory subcategory, SubcategoryDTO subcategoryDTO)
        {
            subcategory.CategoryId = subcategoryDTO.CategoryId;
            subcategory.Name = subcategoryDTO.Name;
            subcategory.Code = subcategoryDTO.Code;
            subcategory.DataEntrySubtotal = subcategoryDTO.DataEntrySubtotal;
            subcategory.SortOrder = subcategoryDTO.SortOrder;
        }
    }
}
