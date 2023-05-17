using Microsoft.EntityFrameworkCore;

namespace WEB.Models
{
    public partial class Response
    {
        internal async System.Threading.Tasks.Task CalculateProgressAsync(ApplicationDbContext db)
        {
            var questionLookup = await db.Questions
                .Include(o => o.SkipLogicOptions)    
                .Where(o => o.QuestionType != QuestionType.Note)
                .Where(o => o.Section.QuestionnaireId == QuestionnaireId)
                // avoid cartesion explosion from includeing skiplogicoptions
                .AsSplitQuery()
                .ToDictionaryAsync(o => o.QuestionId);

            var answerLookup = await db.Answers
                .Include(o => o.AnswerOptions)
                .Where(o => o.ResponseId == ResponseId)
                //.Select(o => new { o.QuestionId, o.AnswerId, o.Value, HasOptions = o.AnswerOptions.Any() })
                .ToDictionaryAsync(o => o.QuestionId);

            var answerIds = answerLookup.Values.Select(o => o.AnswerId).ToHashSet();

            var documentLookup = db.Documents
                .Where(o => answerIds.Contains(o.ItemId))
                .Select(o => o.ItemId)
                .Distinct()
                .ToHashSet();

            TotalQuestions = questionLookup.Keys.Count;

            ApplicableQuestions = 0;
            CompletedQuestions = 0;

            foreach (var questionId in questionLookup.Keys)
            {
                var question = questionLookup[questionId];
                var answer = answerLookup.GetValueOrDefault(questionId);

                // question should be skipped?
                if (!question.ShouldShow(answerLookup))
                    continue;

                if (question.Required)
                {
                    ApplicableQuestions++;

                    if (answer != null)
                    {
                        if (question.QuestionType == QuestionType.Multiline
                            || question.QuestionType == QuestionType.Text
                            )
                        {
                            if (!string.IsNullOrWhiteSpace(answer.Value))
                                CompletedQuestions++;
#if DEBUG
                            else
                                System.Diagnostics.Debug.Print($"incomplete: ${question.Code}");
#endif
                        }
                        else if (question.QuestionType == QuestionType.Document)
                        {
                            if (documentLookup.Contains(answer.AnswerId))
                                CompletedQuestions++;
#if DEBUG
                            else
                                System.Diagnostics.Debug.Print($"incomplete: ${question.Code}");
#endif
                        }
                        else if (question.QuestionType == QuestionType.OptionList)
                        {
                            if (answer.AnswerOptions.Any())
                                CompletedQuestions++;
#if DEBUG
                            else
                                System.Diagnostics.Debug.Print($"incomplete: ${question.Code}");
#endif
                        }
                        else throw new Exception("Unhandled Question Type");
                    }
                }
            }
        }
    }
}
