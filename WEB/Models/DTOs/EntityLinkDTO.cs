using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class EntityLinkDTO
    {
        [Required]
        public Guid ChildEntityId { get; set; }

        [Required]
        public Guid ParentEntityId { get; set; }

        public EntityDTO ChildEntity { get; set; }

        public EntityDTO ParentEntity { get; set; }

    }

    public static partial class ModelFactory
    {
        public static EntityLinkDTO Create(EntityLink entityLink, bool includeParents = true, bool includeChildren = false)
        {
            if (entityLink == null) return null;

            var entityLinkDTO = new EntityLinkDTO();

            entityLinkDTO.ChildEntityId = entityLink.ChildEntityId;
            entityLinkDTO.ParentEntityId = entityLink.ParentEntityId;

            if (includeParents)
            {
                entityLinkDTO.ChildEntity = Create(entityLink.ChildEntity);
                entityLinkDTO.ParentEntity = Create(entityLink.ParentEntity);
            }

            return entityLinkDTO;
        }

        public static void Hydrate(EntityLink entityLink, EntityLinkDTO entityLinkDTO, bool isNew)
        {
        }
    }
}
