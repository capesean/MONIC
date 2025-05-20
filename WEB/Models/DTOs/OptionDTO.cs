using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class OptionDTO
    {
        [Required]
        public Guid OptionId { get; set; }

        [Required]
        public Guid OptionListId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(2000)]
        public string Name { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public OptionListDTO OptionList { get; set; }

        public virtual List<ItemOptionDTO> ItemOptions { get; set; } = new List<ItemOptionDTO>();

    }

    public static partial class ModelFactory
    {
        public static OptionDTO Create(Option option, bool includeParents = true, bool includeChildren = false)
        {
            if (option == null) return null;

            var optionDTO = new OptionDTO();

            optionDTO.OptionId = option.OptionId;
            optionDTO.OptionListId = option.OptionListId;
            optionDTO.Name = option.Name;
            optionDTO.SortOrder = option.SortOrder;

            if (includeParents)
            {
                optionDTO.OptionList = Create(option.OptionList);
            }

            if (includeChildren)
            {
                foreach (var itemOption in option.ItemOptions)
                    optionDTO.ItemOptions.Add(Create(itemOption));
            }

            return optionDTO;
        }

        public static void Hydrate(Option option, OptionDTO optionDTO)
        {
            option.OptionListId = optionDTO.OptionListId;
            option.Name = optionDTO.Name;
            option.SortOrder = optionDTO.SortOrder;
        }
    }
}
