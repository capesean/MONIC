using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public partial class Response
    {
        [Key, Required]
        public Guid ResponseId { get; set; }

        [Required]
        public Guid QuestionnaireId { get; set; }

        [Required]
        public Guid EntityId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        [MaxLength(50)]
        public string PublicCode { get; set; }

        [Column(TypeName = "Date")]
        public DateTime? OpenFrom { get; set; }

        [Column(TypeName = "Date")]
        public DateTime? OpenTo { get; set; }

        [Required]
        public int TotalQuestions { get; set; }

        [Required]
        public int ApplicableQuestions { get; set; }

        [Required]
        public int CompletedQuestions { get; set; }

        [Required]
        public DateTime CreatedOnUtc { get; set; }

        public DateTime? LastAnsweredOnUtc { get; set; }

        public DateTime? SubmittedOnUtc { get; set; }

        public Guid? SubmittedById { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed), Required]
        public bool Submitted { get; private set; }

        public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

        [ForeignKey("DateId")]
        public virtual Date Date { get; set; }

        [ForeignKey("EntityId")]
        public virtual Entity Entity { get; set; }

        [ForeignKey("QuestionnaireId")]
        public virtual Questionnaire Questionnaire { get; set; }

        [ForeignKey("SubmittedById")]
        public virtual User SubmittedBy { get; set; }

        public Response()
        {
            ResponseId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(QuestionnaireId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Response other = (Response)obj;

            return ResponseId == other.ResponseId;
        }

        public override int GetHashCode()
        {
            return ResponseId.GetHashCode();
        }
    }
}
