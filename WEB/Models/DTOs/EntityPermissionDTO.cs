using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class EntityPermissionDTO
    {
        [Required]
        public Guid EntityPermissionId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid EntityId { get; set; }

        public EntityDTO Entity { get; set; }

        public UserDTO User { get; set; }

    }

    public static partial class ModelFactory
    {
        public static EntityPermissionDTO Create(EntityPermission entityPermission, bool includeParents = true, bool includeChildren = false)
        {
            if (entityPermission == null) return null;

            var entityPermissionDTO = new EntityPermissionDTO();

            entityPermissionDTO.EntityPermissionId = entityPermission.EntityPermissionId;
            entityPermissionDTO.UserId = entityPermission.UserId;
            entityPermissionDTO.EntityId = entityPermission.EntityId;

            if (includeParents)
            {
                entityPermissionDTO.Entity = Create(entityPermission.Entity);
                entityPermissionDTO.User = Create(entityPermission.User);
            }

            return entityPermissionDTO;
        }

        public static void Hydrate(EntityPermission entityPermission, EntityPermissionDTO entityPermissionDTO)
        {
            entityPermission.UserId = entityPermissionDTO.UserId;
            entityPermission.EntityId = entityPermissionDTO.EntityId;
        }
    }
}
