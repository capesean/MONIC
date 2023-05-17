using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class GroupDTO
    {
        [Required]
        public Guid GroupId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string Name { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual List<FieldDTO> Fields { get; set; } = new List<FieldDTO>();

    }

    public static partial class ModelFactory
    {
        public static GroupDTO Create(Group group, bool includeParents = true, bool includeChildren = false)
        {
            if (group == null) return null;

            var groupDTO = new GroupDTO();

            groupDTO.GroupId = group.GroupId;
            groupDTO.Name = group.Name;
            groupDTO.SortOrder = group.SortOrder;

            if (includeChildren)
            {
                foreach (var field in group.Fields)
                    groupDTO.Fields.Add(Create(field));
            }

            return groupDTO;
        }

        public static void Hydrate(Group group, GroupDTO groupDTO)
        {
            group.Name = groupDTO.Name;
            group.SortOrder = groupDTO.SortOrder;
        }
    }
}
