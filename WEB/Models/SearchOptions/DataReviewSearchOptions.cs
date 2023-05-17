namespace WEB.Models
{
    public class DataReviewSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? UserId { get; set; }

        public ReviewStatus? ReviewStatus { get; set; }

    }
}
