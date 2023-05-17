using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class DataReviewLink
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public Guid EntityId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        [Required]
        public Guid DataReviewId { get; set; }

        [ForeignKey("DataReviewId")]
        public virtual DataReview DataReview { get; set; }

        public virtual Datum Datum { get; set; }

        public DataReviewLink()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(DataReviewId);
        }
    }
}
