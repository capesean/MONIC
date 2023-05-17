namespace WEB.Models
{
    public class QuestionnaireSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? EntityTypeId { get; set; }

        public DateType? DateType { get; set; }

    }
}
