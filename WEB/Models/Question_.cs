namespace WEB.Models
{
    public partial class Question
    {
        public bool ShouldShow(Dictionary<Guid, Answer> answers)
        {
            if (CheckQuestionId == null) return true;

            var logicAnswer = answers.GetValueOrDefault(CheckQuestionId.Value);
            var hasOption = false;

            if (logicAnswer != null)
            {
                // this.Options must have been loaded (included)
                foreach (var option in SkipLogicOptions)
                {
                    if (logicAnswer.AnswerOptions.Any(o => o.QuestionOptionId == option.CheckQuestionOptionId))
                    {
                        hasOption = true;
                        break;
                    }
                }
            }

            if (SkipLogicAction == SkipLogicAction.Hide) return !hasOption;
            return hasOption;
        }
    }
}
