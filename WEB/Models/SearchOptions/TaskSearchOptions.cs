namespace WEB.Models
{
    public class TaskSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? MilestoneId { get; set; }

        public Guid? ProjectId { get; set; }

    }
}
