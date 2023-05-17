using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class EntityPermission
    {
        [Key, Required]
        public Guid EntityPermissionId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid EntityId { get; set; }

        [ForeignKey("EntityId")]
        public virtual Entity Entity { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public EntityPermission()
        {
            EntityPermissionId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(EntityId);
        }
    }
}
