namespace WEB.Models
{
    public class EntityPermissionSearchOptions : SearchOptions
    {
        public Guid? UserId { get; set; }

        public Guid? EntityId { get; set; }

    }
}
