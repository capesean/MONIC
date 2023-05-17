using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class SkipLogicOption
    {
        [Required]
        public Guid QuestionId { get; set; }

        [Required]
        public Guid CheckQuestionOptionId { get; set; }

        [ForeignKey("QuestionId")]
        public virtual Question Question { get; set; }

        [ForeignKey("CheckQuestionOptionId")]
        public virtual QuestionOption QuestionOption { get; set; }

        public SkipLogicOption()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(CheckQuestionOptionId);
        }
    }
}
