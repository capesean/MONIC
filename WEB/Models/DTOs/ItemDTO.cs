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

        public virtual List<ItemFieldDTO> ItemFields { get; set; } = new List<ItemFieldDTO>();

        public virtual List<ItemOptionDTO> ItemOptions { get; set; } = new List<ItemOptionDTO>();

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
                foreach (var field in item.ItemFields)
                    itemDTO.ItemFields.Add(Create(field));
                foreach (var option in item.ItemOptions)
                    itemDTO.ItemOptions.Add(Create(option));
            }

            return itemDTO;
        }

        public static void Hydrate(Item item, ItemDTO itemDTO)
        {
            item.ItemType = itemDTO.ItemType;
        }
    }
}
