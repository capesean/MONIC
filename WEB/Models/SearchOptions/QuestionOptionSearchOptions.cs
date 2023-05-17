namespace WEB.Models
{
    public class QuestionOptionSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? QuestionOptionGroupId { get; set; }

    }
}
