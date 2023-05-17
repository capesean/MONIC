namespace WEB.Models
{
    public class UserSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public bool? Disabled { get; set; }

        public Guid? AffiliatedEntityId { get; set; }

        public Guid? OrganisationId { get; set; }

    }
}
