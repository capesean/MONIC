using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class QuestionOption
    {
        [Key, Required]
        public Guid QuestionOptionId { get; set; }

        [Required]
        public Guid QuestionOptionGroupId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(500)]
        public string Label { get; set; }

        public int? Value { get; set; }

        [MaxLength(7)]
        public string Color { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<AnswerOption> AnswerOptions { get; set; } = new List<AnswerOption>();

        public virtual ICollection<SkipLogicOption> SkipLogicOptions { get; set; } = new List<SkipLogicOption>();

        [ForeignKey("QuestionOptionGroupId")]
        public virtual QuestionOptionGroup QuestionOptionGroup { get; set; }

        public QuestionOption()
        {
            QuestionOptionId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Label;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            QuestionOption other = (QuestionOption)obj;

            return QuestionOptionId == other.QuestionOptionId;
        }

        public override int GetHashCode()
        {
            return QuestionOptionId.GetHashCode();
        }
    }
}
