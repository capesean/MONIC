namespace WEB.Models
{
    public class FolderContentSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? FolderId { get; set; }

        public Guid? AddedById { get; set; }

    }
}
