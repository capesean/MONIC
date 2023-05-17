namespace WEB.Models
{
    public class ComponentSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public ComponentType? ComponentType { get; set; }

    }
}
