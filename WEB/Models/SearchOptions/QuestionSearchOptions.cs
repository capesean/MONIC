namespace WEB.Models
{
    public class QuestionSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? QuestionnaireId { get; set; }

        public Guid? SectionId { get; set; }

        public QuestionType? QuestionType { get; set; }

        public Guid? QuestionOptionGroupId { get; set; }

    }
}
