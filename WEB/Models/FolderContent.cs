using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class FolderContent
    {
        [Key, Required]
        public Guid FolderContentId { get; set; }

        [Required]
        public Guid FolderId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Html { get; set; }

        [Required]
        public DateTime AddedOn { get; set; }

        [Required]
        public Guid AddedById { get; set; }

        [ForeignKey("FolderId")]
        public virtual Folder Folder { get; set; }

        [ForeignKey("AddedById")]
        public virtual User AddedBy { get; set; }

        public FolderContent()
        {
            FolderContentId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            FolderContent other = (FolderContent)obj;

            return FolderContentId == other.FolderContentId;
        }

        public override int GetHashCode()
        {
            return FolderContentId.GetHashCode();
        }
    }
}
