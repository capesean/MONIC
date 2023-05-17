using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Answer
    {
        [Key, Required]
        public Guid AnswerId { get; set; }

        [Required]
        public Guid ResponseId { get; set; }

        [Required]
        public Guid QuestionId { get; set; }

        public string Value { get; set; }

        public virtual ICollection<AnswerOption> AnswerOptions { get; set; } = new List<AnswerOption>();

        [ForeignKey("QuestionId")]
        public virtual Question Question { get; set; }

        [ForeignKey("ResponseId")]
        public virtual Response Response { get; set; }

        public Answer()
        {
            AnswerId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(QuestionId);
        }
    }
}
