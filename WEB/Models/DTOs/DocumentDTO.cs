using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class DocumentDTO
    {
        [Required]
        public Guid DocumentId { get; set; }

        [Required]
        public Guid ItemId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string FileName { get; set; }

        public string FileContents { get; set; }

        public string Notes { get; set; }

        public DateTime? UploadedOn { get; set; }

        public Guid? UploadedById { get; set; }

        public int? Size { get; set; }

        public ItemDTO Item { get; set; }

        public UserDTO UploadedBy { get; set; }

    }

    public static partial class ModelFactory
    {
        public static DocumentDTO Create(Document document, bool includeParents = true, bool includeChildren = false)
        {
            if (document == null) return null;

            var documentDTO = new DocumentDTO();

            documentDTO.DocumentId = document.DocumentId;
            documentDTO.ItemId = document.ItemId;
            documentDTO.FileName = document.FileName;
            documentDTO.Notes = document.Notes;
            documentDTO.UploadedOn = document.UploadedOn;
            documentDTO.UploadedById = document.UploadedById;
            documentDTO.Size = document.Size;

            if (includeParents)
            {
                documentDTO.Item = Create(document.Item);
                documentDTO.UploadedBy = Create(document.UploadedBy);
            }

            return documentDTO;
        }

        public static void Hydrate(Document document, DocumentDTO documentDTO)
        {
            document.ItemId = documentDTO.ItemId;
            document.FileName = documentDTO.FileName;
            if (documentDTO.FileContents != null) document.FileContents = Convert.FromBase64String(documentDTO.FileContents);
            document.Notes = documentDTO.Notes;
        }
    }
}
