using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class SkipLogicOptionDTO
    {
        [Required]
        public Guid QuestionId { get; set; }

        [Required]
        public Guid CheckQuestionOptionId { get; set; }

        public QuestionDTO Question { get; set; }

        public QuestionOptionDTO QuestionOption { get; set; }

    }

    public static partial class ModelFactory
    {
        public static SkipLogicOptionDTO Create(SkipLogicOption skipLogicOption, bool includeParents = true, bool includeChildren = false)
        {
            if (skipLogicOption == null) return null;

            var skipLogicOptionDTO = new SkipLogicOptionDTO();

            skipLogicOptionDTO.QuestionId = skipLogicOption.QuestionId;
            skipLogicOptionDTO.CheckQuestionOptionId = skipLogicOption.CheckQuestionOptionId;

            if (includeParents)
            {
                skipLogicOptionDTO.QuestionOption = Create(skipLogicOption.QuestionOption);
                skipLogicOptionDTO.Question = Create(skipLogicOption.Question);
            }

            return skipLogicOptionDTO;
        }

        public static void Hydrate(SkipLogicOption skipLogicOption, SkipLogicOptionDTO skipLogicOptionDTO)
        {
        }
    }
}
