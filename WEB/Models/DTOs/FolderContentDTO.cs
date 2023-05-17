using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class FolderContentDTO
    {
        [Required]
        public Guid FolderContentId { get; set; }

        [Required]
        public Guid FolderId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string Html { get; set; }

        public DateTime? AddedOn { get; set; }

        public Guid? AddedById { get; set; }

        public FolderDTO Folder { get; set; }

        public UserDTO AddedBy { get; set; }

    }

    public static partial class ModelFactory
    {
        public static FolderContentDTO Create(FolderContent folderContent, bool includeParents = true, bool includeChildren = false)
        {
            if (folderContent == null) return null;

            var folderContentDTO = new FolderContentDTO();

            folderContentDTO.FolderContentId = folderContent.FolderContentId;
            folderContentDTO.FolderId = folderContent.FolderId;
            folderContentDTO.Name = folderContent.Name;
            folderContentDTO.Html = folderContent.Html;
            folderContentDTO.AddedOn = folderContent.AddedOn;
            folderContentDTO.AddedById = folderContent.AddedById;

            if (includeParents)
            {
                folderContentDTO.AddedBy = Create(folderContent.AddedBy);
                folderContentDTO.Folder = Create(folderContent.Folder);
            }

            return folderContentDTO;
        }

        public static void Hydrate(FolderContent folderContent, FolderContentDTO folderContentDTO)
        {
            folderContent.FolderId = folderContentDTO.FolderId;
            folderContent.Name = folderContentDTO.Name;
            folderContent.Html = folderContentDTO.Html;
        }
    }
}
