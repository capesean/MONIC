namespace WEB.Models
{
    public class DatumSearchOptions : SearchOptions
    {
        public Guid? IndicatorId { get; set; }

        public Guid? EntityId { get; set; }

        public Guid? DateId { get; set; }

        public bool? Aggregated { get; set; }

        public Guid? SubmitDataReviewId { get; set; }

        public Guid? VerifyDataReviewId { get; set; }

        public Guid? ApproveDataReviewId { get; set; }

        public Guid? RejectDataReviewId { get; set; }

        public Guid? LastSavedById { get; set; }

        public DateType? DateType { get; set; }

        public Guid[] EntityIds { get; set; }

    }
}
