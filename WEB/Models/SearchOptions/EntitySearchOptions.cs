namespace WEB.Models
{
    public class EntitySearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? EntityTypeId { get; set; }

        public Guid? OrganisationId { get; set; }

        public bool? Disabled { get; set; }

        public Guid? ParentEntityId { get; set; }

        public bool? IsParent { get; set; }

        public Guid[] EntityIds { get; set; } = new Guid[0];

    }
}
