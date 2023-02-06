namespace WEB.Models
{
    public class UserTestSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? UserId { get; set; }

    }
}
