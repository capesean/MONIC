namespace WEB.Models
{
    public class DocumentSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? ItemId { get; set; }

    }
}
