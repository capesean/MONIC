using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class QuestionSummary
    {
        [Required]
        public Guid QuestionId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        public string Summary { get; set; }

        [ForeignKey("DateId")]
        public virtual Date Date { get; set; }

        [ForeignKey("QuestionId")]
        public virtual Question Question { get; set; }

        public QuestionSummary()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(QuestionId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            QuestionSummary other = (QuestionSummary)obj;

            return QuestionId == other.QuestionId && DateId == other.DateId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + QuestionId.GetHashCode();
            hash = hash * 23 + DateId.GetHashCode();
            return hash;
        }
    }
}
