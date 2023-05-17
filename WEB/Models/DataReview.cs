using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class DataReview
    {
        [Key, Required]
        public Guid DataReviewId { get; set; }

        [Required, Column(TypeName = "Date")]
        public DateTime DateUtc { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public ReviewStatus ReviewStatus { get; set; }

        [Required]
        public ReviewResult ReviewResult { get; set; }

        public string Note { get; set; }

        public virtual ICollection<DataReviewLink> DataReviewLinks { get; set; } = new List<DataReviewLink>();

        public virtual ICollection<Datum> SubmittedData { get; set; } = new List<Datum>();

        public virtual ICollection<Datum> VerifiedData { get; set; } = new List<Datum>();

        public virtual ICollection<Datum> ApprovedData { get; set; } = new List<Datum>();

        public virtual ICollection<Datum> RejectedData { get; set; } = new List<Datum>();

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public DataReview()
        {
            DataReviewId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(DateUtc);
        }
    }
}
