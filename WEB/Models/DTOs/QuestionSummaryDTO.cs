using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class QuestionSummaryDTO
    {
        [Required]
        public Guid QuestionId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        public string Summary { get; set; }

        public DateDTO Date { get; set; }

        public QuestionDTO Question { get; set; }

    }

    public static partial class ModelFactory
    {
        public static QuestionSummaryDTO Create(QuestionSummary questionSummary, bool includeParents = true, bool includeChildren = false)
        {
            if (questionSummary == null) return null;

            var questionSummaryDTO = new QuestionSummaryDTO();

            questionSummaryDTO.QuestionId = questionSummary.QuestionId;
            questionSummaryDTO.DateId = questionSummary.DateId;
            questionSummaryDTO.Summary = questionSummary.Summary;

            if (includeParents)
            {
                questionSummaryDTO.Date = Create(questionSummary.Date);
                questionSummaryDTO.Question = Create(questionSummary.Question);
            }

            return questionSummaryDTO;
        }

        public static void Hydrate(QuestionSummary questionSummary, QuestionSummaryDTO questionSummaryDTO)
        {
            questionSummary.Summary = questionSummaryDTO.Summary;
        }
    }
}
