using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class ItemOptionDTO
    {
        [Required]
        public Guid ItemId { get; set; }

        [Required]
        public Guid FieldId { get; set; }

        [Required]
        public Guid OptionId { get; set; }

        public FieldDTO Field { get; set; }

        public ItemDTO Item { get; set; }

        public OptionDTO Option { get; set; }

    }

    public static partial class ModelFactory
    {
        public static ItemOptionDTO Create(ItemOption itemOption, bool includeParents = true, bool includeChildren = false)
        {
            if (itemOption == null) return null;

            var itemOptionDTO = new ItemOptionDTO();

            itemOptionDTO.ItemId = itemOption.ItemId;
            itemOptionDTO.FieldId = itemOption.FieldId;
            itemOptionDTO.OptionId = itemOption.OptionId;

            if (includeParents)
            {
                itemOptionDTO.Field = Create(itemOption.Field);
                itemOptionDTO.Item = Create(itemOption.Item);
                itemOptionDTO.Option = Create(itemOption.Option);
            }

            return itemOptionDTO;
        }

        public static void Hydrate(ItemOption itemOption, ItemOptionDTO itemOptionDTO)
        {
        }
    }
}
