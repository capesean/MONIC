namespace WEB.Models
{
    public class MilestoneSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? ProjectId { get; set; }

    }
}
