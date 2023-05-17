namespace WEB.Models
{
    public class ResponseSearchOptions : SearchOptions
    {
        public Guid? QuestionnaireId { get; set; }

        public Guid? EntityId { get; set; }

        public Guid? DateId { get; set; }

    }
}
