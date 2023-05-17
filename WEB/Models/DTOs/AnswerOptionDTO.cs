using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class AnswerOptionDTO
    {
        [Required]
        public Guid AnswerId { get; set; }

        [Required]
        public Guid QuestionOptionId { get; set; }

        public AnswerDTO Answer { get; set; }

        public QuestionOptionDTO QuestionOption { get; set; }

    }

    public static partial class ModelFactory
    {
        public static AnswerOptionDTO Create(AnswerOption answerOption, bool includeParents = true, bool includeChildren = false)
        {
            if (answerOption == null) return null;

            var answerOptionDTO = new AnswerOptionDTO();

            answerOptionDTO.AnswerId = answerOption.AnswerId;
            answerOptionDTO.QuestionOptionId = answerOption.QuestionOptionId;

            if (includeParents)
            {
                answerOptionDTO.Answer = Create(answerOption.Answer);
                answerOptionDTO.QuestionOption = Create(answerOption.QuestionOption);
            }

            return answerOptionDTO;
        }

        public static void Hydrate(AnswerOption answerOption, AnswerOptionDTO answerOptionDTO)
        {
        }
    }
}
