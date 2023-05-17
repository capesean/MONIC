namespace WEB.Models
{
    public class ItemSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public ItemType? ItemType { get; set; }

    }
}
