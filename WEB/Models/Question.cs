using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public partial class Question
    {
        [Key, Required]
        public Guid QuestionId { get; set; }

        [Required]
        public Guid SectionId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string Code { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Text { get; set; }

        [Required]
        public QuestionType QuestionType { get; set; }

        public OptionListType? OptionListType { get; set; }

        public string Explanation { get; set; }

        [Required]
        public bool Required { get; set; }

        public Guid? QuestionOptionGroupId { get; set; }

        [Required]
        public byte MinimumDocuments { get; set; }

        [Required]
        public byte MaximumDocuments { get; set; }

        public Guid? CheckQuestionId { get; set; }

        [Required]
        public SkipLogicAction SkipLogicAction { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

        public virtual ICollection<Question> SkipLogicQuestions { get; set; } = new List<Question>();

        public virtual ICollection<SkipLogicOption> SkipLogicOptions { get; set; } = new List<SkipLogicOption>();

        public virtual ICollection<QuestionSummary> QuestionSummaries { get; set; } = new List<QuestionSummary>();

        [ForeignKey("CheckQuestionId")]
        public virtual Question CheckQuestion { get; set; }

        [ForeignKey("QuestionOptionGroupId")]
        public virtual QuestionOptionGroup QuestionOptionGroup { get; set; }

        [ForeignKey("SectionId")]
        public virtual Section Section { get; set; }

        public Question()
        {
            QuestionId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Code;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Question other = (Question)obj;

            return QuestionId == other.QuestionId;
        }

        public override int GetHashCode()
        {
            return QuestionId.GetHashCode();
        }
    }
}
