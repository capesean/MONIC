namespace WEB.Models
{
    public class AnswerOptionSearchOptions : SearchOptions
    {
        public Guid? AnswerId { get; set; }

        public Guid? QuestionOptionId { get; set; }

    }
}
