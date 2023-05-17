namespace WEB.Models
{
    public class FolderSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? ParentFolderId { get; set; }

    }
}
