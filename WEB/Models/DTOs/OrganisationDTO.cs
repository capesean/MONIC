using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class OrganisationDTO : FieldsDTO
    {
        [Required]
        public Guid OrganisationId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(100)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(10)]
        public string Code { get; set; }

        public virtual List<EntityDTO> Entities { get; set; } = new List<EntityDTO>();

        public virtual List<UserDTO> Users { get; set; } = new List<UserDTO>();

    }

    public static partial class ModelFactory
    {
        public static OrganisationDTO Create(Organisation organisation, bool includeParents = true, bool includeChildren = false, Item item = null)
        {
            if (organisation == null) return null;

            var organisationDTO = new OrganisationDTO();

            organisationDTO.OrganisationId = organisation.OrganisationId;
            organisationDTO.Name = organisation.Name;
            organisationDTO.Code = organisation.Code;

            if (includeChildren)
            {
                foreach (var entity in organisation.Entities)
                    organisationDTO.Entities.Add(Create(entity));
                foreach (var user in organisation.Users)
                    organisationDTO.Users.Add(Create(user));
            }

            organisationDTO.AddFields(item);

            return organisationDTO;
        }

        public static void Hydrate(Organisation organisation, OrganisationDTO organisationDTO)
        {
            organisation.Name = organisationDTO.Name;
            organisation.Code = organisationDTO.Code;
        }
    }
}
