using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Section
    {
        [Key, Required]
        public Guid SectionId { get; set; }

        [Required]
        public Guid QuestionnaireId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        [Required]
        public bool CanNavigate { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();

        [ForeignKey("QuestionnaireId")]
        public virtual Questionnaire Questionnaire { get; set; }

        public Section()
        {
            SectionId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Section other = (Section)obj;

            return SectionId == other.SectionId;
        }

        public override int GetHashCode()
        {
            return SectionId.GetHashCode();
        }
    }
}
