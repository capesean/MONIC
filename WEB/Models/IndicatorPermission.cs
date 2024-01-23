using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class IndicatorPermission
    {
        [Key, Required]
        public Guid IndicatorPermissionId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public Guid? IndicatorId { get; set; }

        [Required]
        public bool Edit { get; set; }

        [Required]
        public bool Submit { get; set; }

        [Required]
        public bool Verify { get; set; }

        [Required]
        public bool Approve { get; set; }

        [ForeignKey("IndicatorId")]
        public virtual Indicator Indicator { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public IndicatorPermission()
        {
            IndicatorPermissionId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(IndicatorPermissionId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            IndicatorPermission other = (IndicatorPermission)obj;

            return IndicatorPermissionId == other.IndicatorPermissionId;
        }

        public override int GetHashCode()
        {
            return IndicatorPermissionId.GetHashCode();
        }
    }
}
