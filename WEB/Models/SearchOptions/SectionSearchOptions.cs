namespace WEB.Models
{
    public class SectionSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? QuestionnaireId { get; set; }

    }
}
