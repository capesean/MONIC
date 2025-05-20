namespace WEB.Models
{
    public class OptionSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? OptionListId { get; set; }

    }
}
