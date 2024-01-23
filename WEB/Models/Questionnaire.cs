using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Questionnaire
    {
        [Key, Required]
        public Guid QuestionnaireId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        [Required]
        public Guid EntityTypeId { get; set; }

        [Required]
        public DateType DateType { get; set; }

        public string CreationText { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string CompletionText { get; set; }

        [Required]
        public bool CalculateProgress { get; set; }

        [Required]
        public bool DisplayQuestionCode { get; set; }

        [Required]
        public bool ShowSections { get; set; }

        [MaxLength(50)]
        public string PublicCode { get; set; }

        [Required]
        public bool AllowMultiple { get; set; }

        public Guid? DefaultDateId { get; set; }

        [Required]
        public bool UseSubmit { get; set; }

        [Required]
        public bool SubmitOnCompletion { get; set; }

        public virtual ICollection<Section> Sections { get; set; } = new List<Section>();

        public virtual ICollection<Response> Responses { get; set; } = new List<Response>();

        [ForeignKey("DefaultDateId")]
        public virtual Date Date { get; set; }

        [ForeignKey("EntityTypeId")]
        public virtual EntityType EntityType { get; set; }

        public Questionnaire()
        {
            QuestionnaireId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Questionnaire other = (Questionnaire)obj;

            return QuestionnaireId == other.QuestionnaireId;
        }

        public override int GetHashCode()
        {
            return QuestionnaireId.GetHashCode();
        }
    }
}
