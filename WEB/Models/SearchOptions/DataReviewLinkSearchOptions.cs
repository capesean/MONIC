namespace WEB.Models
{
    public class DataReviewLinkSearchOptions : SearchOptions
    {
        public Guid? IndicatorId { get; set; }

        public Guid? EntityId { get; set; }

        public Guid? DateId { get; set; }

        public Guid? DataReviewId { get; set; }

    }
}
