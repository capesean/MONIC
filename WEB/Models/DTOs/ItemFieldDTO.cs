using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class ItemFieldDTO
    {
        [Required]
        public Guid ItemId { get; set; }

        [Required]
        public Guid FieldId { get; set; }

        public string Value { get; set; }

        public FieldDTO Field { get; set; }

        public ItemDTO Item { get; set; }

    }

    public static partial class ModelFactory
    {
        public static ItemFieldDTO Create(ItemField itemField, bool includeParents = true, bool includeChildren = false)
        {
            if (itemField == null) return null;

            var itemFieldDTO = new ItemFieldDTO();

            itemFieldDTO.ItemId = itemField.ItemId;
            itemFieldDTO.FieldId = itemField.FieldId;
            itemFieldDTO.Value = itemField.Value;

            if (includeParents)
            {
                itemFieldDTO.Field = Create(itemField.Field);
                itemFieldDTO.Item = Create(itemField.Item);
            }

            return itemFieldDTO;
        }

        public static void Hydrate(ItemField itemField, ItemFieldDTO itemFieldDTO)
        {
            itemField.Value = itemFieldDTO.Value;
        }
    }
}
