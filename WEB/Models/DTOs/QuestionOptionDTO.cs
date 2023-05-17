using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class QuestionOptionDTO
    {
        [Required]
        public Guid QuestionOptionId { get; set; }

        [Required]
        public Guid QuestionOptionGroupId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(500)]
        public string Label { get; set; }

        public int? Value { get; set; }

        [MaxLength(7)]
        public string Color { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public QuestionOptionGroupDTO QuestionOptionGroup { get; set; }

        public virtual List<AnswerOptionDTO> AnswerOptions { get; set; } = new List<AnswerOptionDTO>();

        public virtual List<SkipLogicOptionDTO> SkipLogicOptions { get; set; } = new List<SkipLogicOptionDTO>();

    }

    public static partial class ModelFactory
    {
        public static QuestionOptionDTO Create(QuestionOption questionOption, bool includeParents = true, bool includeChildren = false)
        {
            if (questionOption == null) return null;

            var questionOptionDTO = new QuestionOptionDTO();

            questionOptionDTO.QuestionOptionId = questionOption.QuestionOptionId;
            questionOptionDTO.QuestionOptionGroupId = questionOption.QuestionOptionGroupId;
            questionOptionDTO.Label = questionOption.Label;
            questionOptionDTO.Value = questionOption.Value;
            questionOptionDTO.Color = questionOption.Color;
            questionOptionDTO.SortOrder = questionOption.SortOrder;

            if (includeParents)
            {
                questionOptionDTO.QuestionOptionGroup = Create(questionOption.QuestionOptionGroup);
            }

            if (includeChildren)
            {
                foreach (var answerOption in questionOption.AnswerOptions)
                    questionOptionDTO.AnswerOptions.Add(Create(answerOption));
                foreach (var skipLogicOption in questionOption.SkipLogicOptions)
                    questionOptionDTO.SkipLogicOptions.Add(Create(skipLogicOption));
            }

            return questionOptionDTO;
        }

        public static void Hydrate(QuestionOption questionOption, QuestionOptionDTO questionOptionDTO)
        {
            questionOption.QuestionOptionGroupId = questionOptionDTO.QuestionOptionGroupId;
            questionOption.Label = questionOptionDTO.Label;
            questionOption.Value = questionOptionDTO.Value;
            questionOption.Color = questionOptionDTO.Color;
            questionOption.SortOrder = questionOptionDTO.SortOrder;
        }
    }
}
