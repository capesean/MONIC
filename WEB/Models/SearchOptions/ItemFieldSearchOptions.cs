namespace WEB.Models
{
    public class ItemFieldSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? ItemId { get; set; }

        public Guid? FieldId { get; set; }

    }
}
