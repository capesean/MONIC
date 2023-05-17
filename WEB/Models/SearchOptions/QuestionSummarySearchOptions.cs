namespace WEB.Models
{
    public class QuestionSummarySearchOptions : SearchOptions
    {
        public Guid? QuestionId { get; set; }

        public Guid? DateId { get; set; }

    }
}
