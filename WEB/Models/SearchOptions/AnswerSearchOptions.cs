namespace Monic.Web.Models
{
    public class AnswerSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? ResponseId { get; set; }

        public Guid? QuestionId { get; set; }

    }
}
