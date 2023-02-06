namespace WEB.Models
{
    public class UserSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public bool? Disabled { get; set; }

    }
}
