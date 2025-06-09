namespace WEB.Models
{
    public class IndicatorSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? SubcategoryId { get; set; }

        public Guid? CategoryId { get; set; }

        public IndicatorType? IndicatorType { get; set; }

        public IndicatorStatus? IndicatorStatus { get; set; }

        public Guid? EntityTypeId { get; set; }

        public DateType? Frequency { get; set; }

        public Guid? GroupingIndicatorId { get; set; }

        public Guid? CreatedById { get; set; }

    }
}
