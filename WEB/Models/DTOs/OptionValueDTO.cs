using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class OptionValueDTO
    {
        [Required]
        public Guid ItemId { get; set; }

        [Required]
        public Guid OptionId { get; set; }

        public ItemDTO Item { get; set; }

        public OptionDTO Option { get; set; }

    }

    public static partial class ModelFactory
    {
        public static OptionValueDTO Create(OptionValue optionValue, bool includeParents = true, bool includeChildren = false)
        {
            if (optionValue == null) return null;

            var optionValueDTO = new OptionValueDTO();

            optionValueDTO.ItemId = optionValue.ItemId;
            optionValueDTO.OptionId = optionValue.OptionId;

            if (includeParents)
            {
                optionValueDTO.Item = Create(optionValue.Item);
                optionValueDTO.Option = Create(optionValue.Option);
            }

            return optionValueDTO;
        }

        public static void Hydrate(OptionValue optionValue, OptionValueDTO optionValueDTO)
        {
        }
    }
}
