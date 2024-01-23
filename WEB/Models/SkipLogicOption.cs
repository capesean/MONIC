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

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            SkipLogicOption other = (SkipLogicOption)obj;

            return QuestionId == other.QuestionId && CheckQuestionOptionId == other.CheckQuestionOptionId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + QuestionId.GetHashCode();
            hash = hash * 23 + CheckQuestionOptionId.GetHashCode();
            return hash;
        }
    }
}
