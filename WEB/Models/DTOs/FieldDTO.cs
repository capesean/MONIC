using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace WEB.Models
{
    public class FieldDTO
    {
        [Required]
        public Guid FieldId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(2000)]
        public string Name { get; set; }

        [Required]
        public FieldType FieldType { get; set; }

        public Guid? OptionListId { get; set; }

        [Required]
        public bool Organisation { get; set; }

        [Required]
        public bool Entity { get; set; }

        [Required]
        public bool Indicator { get; set; }

        [Required]
        public bool Component { get; set; }

        [Required]
        public bool Relationship { get; set; }

        [Required]
        public bool Folder { get; set; }

        [Required]
        public bool Category { get; set; }

        [Required]
        public bool Subcategory { get; set; }

        [Required]
        public bool Required { get; set; }

        [Required]
        public bool IsUnique { get; set; }

        [Required]
        public Size Size { get; set; }

        public short? MinLength { get; set; }

        public short? MaxLength { get; set; }

        [MaxLength(250)]
        public string RegEx { get; set; }

        [Required]
        public int SortOrder { get; set; }

        [Required]
        public bool Multiple { get; set; }

        [Required]
        public bool RadioCheckbox { get; set; }

        [Required]
        public bool MultiLine { get; set; }

        public Guid? GroupId { get; set; }

        [Required]
        public short Rows { get; set; }

        public GroupDTO Group { get; set; }

        public OptionListDTO OptionList { get; set; }

        public virtual List<ItemFieldDTO> ItemFields { get; set; } = new List<ItemFieldDTO>();

    }

    public static partial class ModelFactory
    {
        public static FieldDTO Create(Field field, bool includeParents = true, bool includeChildren = false)
        {
            if (field == null) return null;

            var fieldDTO = new FieldDTO();

            fieldDTO.FieldId = field.FieldId;
            fieldDTO.Name = field.Name;
            fieldDTO.FieldType = field.FieldType;
            fieldDTO.OptionListId = field.OptionListId;
            fieldDTO.Organisation = field.Organisation;
            fieldDTO.Entity = field.Entity;
            fieldDTO.Indicator = field.Indicator;
            fieldDTO.Component = field.Component;
            fieldDTO.Relationship = field.Relationship;
            fieldDTO.Folder = field.Folder;
            fieldDTO.Category = field.Category;
            fieldDTO.Subcategory = field.Subcategory;
            fieldDTO.Required = field.Required;
            fieldDTO.IsUnique = field.IsUnique;
            fieldDTO.Size = field.Size;
            fieldDTO.MinLength = field.MinLength;
            fieldDTO.MaxLength = field.MaxLength;
            fieldDTO.RegEx = field.RegEx;
            fieldDTO.SortOrder = field.SortOrder;
            fieldDTO.Multiple = field.Multiple;
            fieldDTO.RadioCheckbox = field.RadioCheckbox;
            fieldDTO.MultiLine = field.MultiLine;
            fieldDTO.GroupId = field.GroupId;
            fieldDTO.Rows = field.Rows;

            if (includeParents)
            {
                fieldDTO.Group = Create(field.Group);
                fieldDTO.OptionList = Create(field.OptionList);
            }

            if (includeChildren)
            {
                foreach (var itemField in field.ItemFields)
                    fieldDTO.ItemFields.Add(Create(itemField));
            }

            return fieldDTO;
        }

        public static void Hydrate(Field field, FieldDTO fieldDTO, bool isNew)
        {
            field.Name = fieldDTO.Name;
            if (isNew) field.FieldType = fieldDTO.FieldType;
            field.OptionListId = fieldDTO.OptionListId;
            field.Organisation = fieldDTO.Organisation;
            field.Entity = fieldDTO.Entity;
            field.Indicator = fieldDTO.Indicator;
            field.Component = fieldDTO.Component;
            field.Relationship = fieldDTO.Relationship;
            field.Folder = fieldDTO.Folder;
            field.Category = fieldDTO.Category;
            field.Subcategory = fieldDTO.Subcategory;
            field.Required = fieldDTO.Required;
            field.IsUnique = fieldDTO.IsUnique;
            field.Size = fieldDTO.Size;
            field.MinLength = fieldDTO.MinLength;
            field.MaxLength = fieldDTO.MaxLength;
            field.RegEx = fieldDTO.RegEx;
            field.SortOrder = fieldDTO.SortOrder;
            field.Multiple = fieldDTO.Multiple;
            field.RadioCheckbox = fieldDTO.RadioCheckbox;
            field.MultiLine = fieldDTO.MultiLine;
            field.GroupId = fieldDTO.GroupId;
            field.Rows = fieldDTO.Rows;
        }
    }
}
