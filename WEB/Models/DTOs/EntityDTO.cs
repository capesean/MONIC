using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class EntityDTO : FieldsDTO
    {
        [Required]
        public Guid EntityId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(200)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(25)]
        public string Code { get; set; }

        [Required]
        public Guid EntityTypeId { get; set; }

        public Guid? OrganisationId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string ShortName { get; set; }

        [Required]
        public bool Disabled { get; set; }

        public EntityTypeDTO EntityType { get; set; }

        public OrganisationDTO Organisation { get; set; }

        public virtual List<DatumDTO> Data { get; set; } = new List<DatumDTO>();

        public virtual List<EntityLinkDTO> ChildEntities { get; set; } = new List<EntityLinkDTO>();

        public virtual List<EntityLinkDTO> ParentEntities { get; set; } = new List<EntityLinkDTO>();

        public virtual List<EntityPermissionDTO> EntityPermissions { get; set; } = new List<EntityPermissionDTO>();

        public virtual List<ResponseDTO> Responses { get; set; } = new List<ResponseDTO>();

        public virtual List<UserDTO> AffiliatedUsers { get; set; } = new List<UserDTO>();

    }

    public static partial class ModelFactory
    {
        public static EntityDTO Create(Entity entity, bool includeParents = true, bool includeChildren = false, Item item = null)
        {
            if (entity == null) return null;

            var entityDTO = new EntityDTO();

            entityDTO.EntityId = entity.EntityId;
            entityDTO.Name = entity.Name;
            entityDTO.Code = entity.Code;
            entityDTO.EntityTypeId = entity.EntityTypeId;
            entityDTO.OrganisationId = entity.OrganisationId;
            entityDTO.ShortName = entity.ShortName;
            entityDTO.Disabled = entity.Disabled;

            if (includeParents)
            {
                entityDTO.EntityType = Create(entity.EntityType);
                entityDTO.Organisation = Create(entity.Organisation);
            }

            if (includeChildren)
            {
                foreach (var affiliatedUser in entity.AffiliatedUsers)
                    entityDTO.AffiliatedUsers.Add(Create(affiliatedUser));
                foreach (var childEntity in entity.ChildEntities)
                    entityDTO.ChildEntities.Add(Create(childEntity));
                foreach (var datum in entity.Data)
                    entityDTO.Data.Add(Create(datum));
                foreach (var entityPermission in entity.EntityPermissions)
                    entityDTO.EntityPermissions.Add(Create(entityPermission));
                foreach (var parentEntity in entity.ParentEntities)
                    entityDTO.ParentEntities.Add(Create(parentEntity));
                foreach (var response in entity.Responses)
                    entityDTO.Responses.Add(Create(response));
            }

            entityDTO.AddFields(item);

            return entityDTO;
        }

        public static void Hydrate(Entity entity, EntityDTO entityDTO, bool isNew)
        {
            entity.Name = entityDTO.Name;
            entity.Code = entityDTO.Code;
            if (isNew) entity.EntityTypeId = entityDTO.EntityTypeId;
            entity.OrganisationId = entityDTO.OrganisationId;
            entity.ShortName = entityDTO.ShortName;
            entity.Disabled = entityDTO.Disabled;
        }
    }
}
