using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class AnswerOption
    {
        [Required]
        public Guid AnswerId { get; set; }

        [Required]
        public Guid QuestionOptionId { get; set; }

        [ForeignKey("AnswerId")]
        public virtual Answer Answer { get; set; }

        [ForeignKey("QuestionOptionId")]
        public virtual QuestionOption QuestionOption { get; set; }

        public AnswerOption()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(QuestionOptionId);
        }
    }
}
