using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;

namespace WEB.Models
{
    public class UserDTO
    {
        [Required]
        public Guid Id { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string FirstName { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string LastName { get; set; }

        public string FullName { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(256)]
        public string Email { get; set; }

        [Required]
        public bool Disabled { get; set; }

        public Guid? AffiliatedEntityId { get; set; }

        public Guid? OrganisationId { get; set; }

        public DateTime? LastLoginDate { get; set; }

        public EntityDTO Entity { get; set; }

        public OrganisationDTO Organisation { get; set; }

        public virtual List<DataReviewDTO> DataReviews { get; set; } = new List<DataReviewDTO>();

        public virtual List<DatumDTO> LastSavedData { get; set; } = new List<DatumDTO>();

        public virtual List<DocumentDTO> UploadedDocuments { get; set; } = new List<DocumentDTO>();

        public virtual List<EntityPermissionDTO> EntityPermissions { get; set; } = new List<EntityPermissionDTO>();

        public virtual List<FolderContentDTO> AddedFolderContents { get; set; } = new List<FolderContentDTO>();

        public virtual List<IndicatorDTO> CreatedIndicators { get; set; } = new List<IndicatorDTO>();

        public virtual List<IndicatorPermissionDTO> IndicatorPermissions { get; set; } = new List<IndicatorPermissionDTO>();

        public virtual List<ResponseDTO> SubmittedResponses { get; set; } = new List<ResponseDTO>();

        public IList<string> Roles { get; set; }

    }

    public static partial class ModelFactory
    {
        public static UserDTO Create(User user, bool includeParents = true, bool includeChildren = false, List<Role> dbRoles = null)
        {
            if (user == null) return null;

            var userRoles = new List<string>();
            if (user.Roles != null && dbRoles != null)
                userRoles = dbRoles.Where(o => user.Roles.Any(r => r.RoleId == o.Id)).Select(o => o.Name).ToList();

            var userDTO = new UserDTO();

            userDTO.Id = user.Id;
            userDTO.FirstName = user.FirstName;
            userDTO.LastName = user.LastName;
            userDTO.FullName = user.FullName;
            userDTO.Email = user.Email;
            userDTO.Disabled = user.Disabled;
            userDTO.AffiliatedEntityId = user.AffiliatedEntityId;
            userDTO.OrganisationId = user.OrganisationId;
            userDTO.LastLoginDate = user.LastLoginDate;
            userDTO.Roles = userRoles;

            if (includeParents)
            {
                userDTO.Entity = Create(user.Entity);
                userDTO.Organisation = Create(user.Organisation);
            }

            if (includeChildren)
            {
                foreach (var addedFolderContent in user.AddedFolderContents)
                    userDTO.AddedFolderContents.Add(Create(addedFolderContent));
                foreach (var dataReview in user.DataReviews)
                    userDTO.DataReviews.Add(Create(dataReview));
                foreach (var entityPermission in user.EntityPermissions)
                    userDTO.EntityPermissions.Add(Create(entityPermission));
                foreach (var indicatorPermission in user.IndicatorPermissions)
                    userDTO.IndicatorPermissions.Add(Create(indicatorPermission));
                foreach (var response in user.SubmittedResponses)
                    userDTO.SubmittedResponses.Add(Create(response));
                foreach (var uploadedDocument in user.UploadedDocuments)
                    userDTO.UploadedDocuments.Add(Create(uploadedDocument));
            }

            return userDTO;
        }

        public static void Hydrate(User user, UserDTO userDTO)
        {
            user.UserName = userDTO.Email;
            user.FirstName = userDTO.FirstName;
            user.LastName = userDTO.LastName;
            user.Email = userDTO.Email;
            user.Disabled = userDTO.Disabled;
            user.AffiliatedEntityId = userDTO.AffiliatedEntityId;
            user.OrganisationId = userDTO.OrganisationId;
        }
    }
}
