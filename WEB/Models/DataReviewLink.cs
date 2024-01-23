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

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            DataReviewLink other = (DataReviewLink)obj;

            return IndicatorId == other.IndicatorId && EntityId == other.EntityId && DateId == other.DateId && DataReviewId == other.DataReviewId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + IndicatorId.GetHashCode();
            hash = hash * 23 + EntityId.GetHashCode();
            hash = hash * 23 + DateId.GetHashCode();
            hash = hash * 23 + DataReviewId.GetHashCode();
            return hash;
        }
    }
}
