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

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            AnswerOption other = (AnswerOption)obj;

            return AnswerId == other.AnswerId && QuestionOptionId == other.QuestionOptionId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + AnswerId.GetHashCode();
            hash = hash * 23 + QuestionOptionId.GetHashCode();
            return hash;
        }
    }
}
