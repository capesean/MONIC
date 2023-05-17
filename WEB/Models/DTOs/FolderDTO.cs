using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class FolderDTO : FieldsDTO
    {
        [Required]
        public Guid FolderId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        public string Description { get; set; }

        public Guid? ParentFolderId { get; set; }

        public bool RootFolder { get; set; }

        public FolderDTO ParentFolder { get; set; }

        public virtual List<FolderDTO> Subfolders { get; set; } = new List<FolderDTO>();

        public virtual List<FolderContentDTO> FolderContents { get; set; } = new List<FolderContentDTO>();

    }

    public static partial class ModelFactory
    {
        public static FolderDTO Create(Folder folder, bool includeParents = true, bool includeChildren = false, Item item = null)
        {
            if (folder == null) return null;

            var folderDTO = new FolderDTO();

            folderDTO.FolderId = folder.FolderId;
            folderDTO.Name = folder.Name;
            folderDTO.Description = folder.Description;
            folderDTO.ParentFolderId = folder.ParentFolderId;
            folderDTO.RootFolder = folder.RootFolder;

            if (includeParents)
            {
                folderDTO.ParentFolder = Create(folder.ParentFolder);
            }

            if (includeChildren)
            {
                foreach (var folderContent in folder.FolderContents)
                    folderDTO.FolderContents.Add(Create(folderContent));
                foreach (var subfolder in folder.Subfolders)
                    folderDTO.Subfolders.Add(Create(subfolder));
            }

            folderDTO.AddFields(item);

            return folderDTO;
        }

        public static void Hydrate(Folder folder, FolderDTO folderDTO)
        {
            folder.Name = folderDTO.Name;
            folder.Description = folderDTO.Description;
            folder.ParentFolderId = folderDTO.ParentFolderId;
        }
    }
}
