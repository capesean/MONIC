using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public partial class Date
    {
        [Key, Required]
        public Guid DateId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(15)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(8)]
        public string Code { get; set; }

        [Required]
        public DateType DateType { get; set; }

        public Guid? QuarterId { get; set; }

        public Guid? YearId { get; set; }

        [Required, Column(TypeName = "Date")]
        public DateTime OpenFrom { get; set; }

        [Required, Column(TypeName = "Date")]
        public DateTime OpenTo { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Datum> Data { get; set; } = new List<Datum>();

        public virtual ICollection<Date> DatesInQuarter { get; set; } = new List<Date>();

        public virtual ICollection<Date> DatesInYear { get; set; } = new List<Date>();

        public virtual ICollection<Response> Responses { get; set; } = new List<Response>();

        public virtual ICollection<Questionnaire> DefaultDateQuestionnaires { get; set; } = new List<Questionnaire>();

        public virtual ICollection<QuestionSummary> QuestionSummaries { get; set; } = new List<QuestionSummary>();

        [ForeignKey("QuarterId")]
        public virtual Date Quarter { get; set; }

        [ForeignKey("YearId")]
        public virtual Date Year { get; set; }

        public Date()
        {
            DateId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
