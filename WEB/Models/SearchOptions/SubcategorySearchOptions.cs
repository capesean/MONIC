namespace WEB.Models
{
    public class SubcategorySearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? CategoryId { get; set; }

    }
}
