using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public partial class User
    {
        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string FirstName { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string LastName { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed), Required(AllowEmptyStrings = true), MaxLength(250)]
        public string FullName { get; private set; }

        [Required]
        public bool Disabled { get; set; }

        public Guid? AffiliatedEntityId { get; set; }

        public Guid? OrganisationId { get; set; }

        public DateTime? LastLoginDate { get; set; }

        public string DashboardSettings { get; set; }

        public virtual ICollection<EntityPermission> EntityPermissions { get; set; } = new List<EntityPermission>();

        public virtual ICollection<IndicatorPermission> IndicatorPermissions { get; set; } = new List<IndicatorPermission>();

        public virtual ICollection<Datum> LastSavedData { get; set; } = new List<Datum>();

        public virtual ICollection<Indicator> CreatedIndicators { get; set; } = new List<Indicator>();

        public virtual ICollection<DataReview> DataReviews { get; set; } = new List<DataReview>();

        public virtual ICollection<Response> SubmittedResponses { get; set; } = new List<Response>();

        public virtual ICollection<Document> UploadedDocuments { get; set; } = new List<Document>();

        public virtual ICollection<FolderContent> AddedFolderContents { get; set; } = new List<FolderContent>();

        [ForeignKey("AffiliatedEntityId")]
        public virtual Entity Entity { get; set; }

        [ForeignKey("OrganisationId")]
        public virtual Organisation Organisation { get; set; }

        public User()
        {
            Id = Guid.NewGuid();
        }

        public override string ToString()
        {
            return FullName;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            User other = (User)obj;

            return Id == other.Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }
    }
}
