using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class ItemDTO
    {
        [Required]
        public Guid ItemId { get; set; }

        [Required]
        public ItemType ItemType { get; set; }

        public virtual List<DocumentDTO> Documents { get; set; } = new List<DocumentDTO>();

        public virtual List<FieldValueDTO> FieldValues { get; set; } = new List<FieldValueDTO>();

        public virtual List<OptionValueDTO> OptionValues { get; set; } = new List<OptionValueDTO>();

    }

    public static partial class ModelFactory
    {
        public static ItemDTO Create(Item item, bool includeParents = true, bool includeChildren = false)
        {
            if (item == null) return null;

            var itemDTO = new ItemDTO();

            itemDTO.ItemId = item.ItemId;
            itemDTO.ItemType = item.ItemType;

            if (includeChildren)
            {
                foreach (var document in item.Documents)
                    itemDTO.Documents.Add(Create(document));
                foreach (var fieldValue in item.FieldValues)
                    itemDTO.FieldValues.Add(Create(fieldValue));
                foreach (var optionValue in item.OptionValues)
                    itemDTO.OptionValues.Add(Create(optionValue));
            }

            return itemDTO;
        }

        public static void Hydrate(Item item, ItemDTO itemDTO)
        {
            item.ItemType = itemDTO.ItemType;
        }
    }
}
