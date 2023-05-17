using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class FieldValueDTO
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
        public static FieldValueDTO Create(FieldValue fieldValue, bool includeParents = true, bool includeChildren = false)
        {
            if (fieldValue == null) return null;

            var fieldValueDTO = new FieldValueDTO();

            fieldValueDTO.ItemId = fieldValue.ItemId;
            fieldValueDTO.FieldId = fieldValue.FieldId;
            fieldValueDTO.Value = fieldValue.Value;

            if (includeParents)
            {
                fieldValueDTO.Field = Create(fieldValue.Field);
                fieldValueDTO.Item = Create(fieldValue.Item);
            }

            return fieldValueDTO;
        }

        public static void Hydrate(FieldValue fieldValue, FieldValueDTO fieldValueDTO)
        {
            fieldValue.Value = fieldValueDTO.Value;
        }
    }
}
