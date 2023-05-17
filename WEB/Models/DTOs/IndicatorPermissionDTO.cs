using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class IndicatorPermissionDTO
    {
        [Required]
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

        public IndicatorDTO Indicator { get; set; }

        public UserDTO User { get; set; }

    }

    public static partial class ModelFactory
    {
        public static IndicatorPermissionDTO Create(IndicatorPermission indicatorPermission, bool includeParents = true, bool includeChildren = false)
        {
            if (indicatorPermission == null) return null;

            var indicatorPermissionDTO = new IndicatorPermissionDTO();

            indicatorPermissionDTO.IndicatorPermissionId = indicatorPermission.IndicatorPermissionId;
            indicatorPermissionDTO.UserId = indicatorPermission.UserId;
            indicatorPermissionDTO.IndicatorId = indicatorPermission.IndicatorId;
            indicatorPermissionDTO.Edit = indicatorPermission.Edit;
            indicatorPermissionDTO.Submit = indicatorPermission.Submit;
            indicatorPermissionDTO.Verify = indicatorPermission.Verify;
            indicatorPermissionDTO.Approve = indicatorPermission.Approve;

            if (includeParents)
            {
                indicatorPermissionDTO.Indicator = Create(indicatorPermission.Indicator);
                indicatorPermissionDTO.User = Create(indicatorPermission.User);
            }

            return indicatorPermissionDTO;
        }

        public static void Hydrate(IndicatorPermission indicatorPermission, IndicatorPermissionDTO indicatorPermissionDTO)
        {
            indicatorPermission.UserId = indicatorPermissionDTO.UserId;
            indicatorPermission.IndicatorId = indicatorPermissionDTO.IndicatorId;
            indicatorPermission.Edit = indicatorPermissionDTO.Edit;
            indicatorPermission.Submit = indicatorPermissionDTO.Submit;
            indicatorPermission.Verify = indicatorPermissionDTO.Verify;
            indicatorPermission.Approve = indicatorPermissionDTO.Approve;
        }
    }
}
