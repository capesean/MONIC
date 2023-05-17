namespace WEB.Models
{
    public class IndicatorPermissionSearchOptions : SearchOptions
    {
        public Guid? UserId { get; set; }

        public Guid? IndicatorId { get; set; }

        public bool? Verify { get; set; }

    }
}
