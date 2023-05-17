using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class QuestionOptionGroupDTO
    {
        [Required]
        public Guid QuestionOptionGroupId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string Name { get; set; }

        [Required]
        public bool Shared { get; set; }

        public virtual List<QuestionDTO> Questions { get; set; } = new List<QuestionDTO>();

        public virtual List<QuestionOptionDTO> QuestionOptions { get; set; } = new List<QuestionOptionDTO>();

    }

    public static partial class ModelFactory
    {
        public static QuestionOptionGroupDTO Create(QuestionOptionGroup questionOptionGroup, bool includeParents = true, bool includeChildren = false)
        {
            if (questionOptionGroup == null) return null;

            var questionOptionGroupDTO = new QuestionOptionGroupDTO();

            questionOptionGroupDTO.QuestionOptionGroupId = questionOptionGroup.QuestionOptionGroupId;
            questionOptionGroupDTO.Name = questionOptionGroup.Name;
            questionOptionGroupDTO.Shared = questionOptionGroup.Shared;

            if (includeChildren)
            {
                foreach (var questionOption in questionOptionGroup.QuestionOptions)
                    questionOptionGroupDTO.QuestionOptions.Add(Create(questionOption));
                foreach (var question in questionOptionGroup.Questions)
                    questionOptionGroupDTO.Questions.Add(Create(question));
            }

            return questionOptionGroupDTO;
        }

        public static void Hydrate(QuestionOptionGroup questionOptionGroup, QuestionOptionGroupDTO questionOptionGroupDTO)
        {
            questionOptionGroup.Name = questionOptionGroupDTO.Name;
            questionOptionGroup.Shared = questionOptionGroupDTO.Shared;
        }
    }
}
