using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class AnswerDTO
    {
        [Required]
        public Guid AnswerId { get; set; }

        [Required]
        public Guid ResponseId { get; set; }

        [Required]
        public Guid QuestionId { get; set; }

        public string Value { get; set; }

        public QuestionDTO Question { get; set; }

        public ResponseDTO Response { get; set; }

        public virtual List<AnswerOptionDTO> AnswerOptions { get; set; } = new List<AnswerOptionDTO>();

    }

    public static partial class ModelFactory
    {
        public static AnswerDTO Create(Answer answer, bool includeParents = true, bool includeChildren = false)
        {
            if (answer == null) return null;

            var answerDTO = new AnswerDTO();

            answerDTO.AnswerId = answer.AnswerId;
            answerDTO.ResponseId = answer.ResponseId;
            answerDTO.QuestionId = answer.QuestionId;
            answerDTO.Value = answer.Value;

            if (includeParents)
            {
                answerDTO.Question = Create(answer.Question);
                answerDTO.Response = Create(answer.Response);
            }

            if (includeChildren)
            {
                foreach (var answerOption in answer.AnswerOptions)
                    answerDTO.AnswerOptions.Add(Create(answerOption));
            }

            return answerDTO;
        }

        public static void Hydrate(Answer answer, AnswerDTO answerDTO)
        {
            answer.ResponseId = answerDTO.ResponseId;
            answer.QuestionId = answerDTO.QuestionId;
            answer.Value = answerDTO.Value;
        }
    }
}
