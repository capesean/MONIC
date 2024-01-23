using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class QuestionOptionGroup
    {
        [Key, Required]
        public Guid QuestionOptionGroupId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string Name { get; set; }

        [Required]
        public bool Shared { get; set; }

        public virtual ICollection<QuestionOption> QuestionOptions { get; set; } = new List<QuestionOption>();

        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();

        public QuestionOptionGroup()
        {
            QuestionOptionGroupId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            QuestionOptionGroup other = (QuestionOptionGroup)obj;

            return QuestionOptionGroupId == other.QuestionOptionGroupId;
        }

        public override int GetHashCode()
        {
            return QuestionOptionGroupId.GetHashCode();
        }
    }
}
