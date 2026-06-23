namespace Monic.Web.Models
{
    public class EntityLinkSearchOptions : SearchOptions
    {
        public Guid? ChildEntityId { get; set; }

        public Guid? ParentEntityId { get; set; }

    }
}
