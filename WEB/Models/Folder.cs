using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Folder
    {
        [Key, Required]
        public Guid FolderId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        public string Description { get; set; }

        public Guid? ParentFolderId { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool RootFolder { get; private set; }

        public virtual ICollection<Folder> Subfolders { get; set; } = new List<Folder>();

        public virtual ICollection<FolderContent> FolderContents { get; set; } = new List<FolderContent>();

        [ForeignKey("ParentFolderId")]
        public virtual Folder ParentFolder { get; set; }

        public Folder()
        {
            FolderId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Folder other = (Folder)obj;

            return FolderId == other.FolderId;
        }

        public override int GetHashCode()
        {
            return FolderId.GetHashCode();
        }
    }
}
