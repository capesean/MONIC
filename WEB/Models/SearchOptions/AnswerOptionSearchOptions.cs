namespace Monic.Web.Models
{
    public class AnswerOptionSearchOptions : SearchOptions
    {
        public Guid? AnswerId { get; set; }

        public Guid? QuestionOptionId { get; set; }

    }
}
