using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Datum
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public Guid EntityId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        [Column(TypeName = "decimal(20, 8)")]
        public decimal? Value { get; set; }

        [MaxLength(250)]
        public string Note { get; set; }

        [Required]
        public bool Aggregated { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed), Required]
        public bool Submitted { get; private set; }

        public Guid? SubmitDataReviewId { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed), Required]
        public bool Verified { get; private set; }

        public Guid? VerifyDataReviewId { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed), Required]
        public bool Approved { get; private set; }

        public Guid? ApproveDataReviewId { get; set; }

        public Guid? RejectDataReviewId { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed), Required]
        public bool Rejected { get; private set; }

        [Required]
        public DateTime LastSavedDateUtc { get; set; }

        [Required]
        public Guid LastSavedById { get; set; }

        public virtual ICollection<DataReviewLink> DataReviewLinks { get; set; } = new List<DataReviewLink>();

        [ForeignKey("ApproveDataReviewId")]
        public virtual DataReview ApproveReview { get; set; }

        [ForeignKey("RejectDataReviewId")]
        public virtual DataReview RejectReview { get; set; }

        [ForeignKey("SubmitDataReviewId")]
        public virtual DataReview SubmitReview { get; set; }

        [ForeignKey("VerifyDataReviewId")]
        public virtual DataReview VerifyReview { get; set; }

        [ForeignKey("DateId")]
        public virtual Date Date { get; set; }

        [ForeignKey("EntityId")]
        public virtual Entity Entity { get; set; }

        [ForeignKey("IndicatorId")]
        public virtual Indicator Indicator { get; set; }

        [ForeignKey("LastSavedById")]
        public virtual User LastSavedBy { get; set; }

        public Datum()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(Value);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Datum other = (Datum)obj;

            return IndicatorId == other.IndicatorId && EntityId == other.EntityId && DateId == other.DateId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + IndicatorId.GetHashCode();
            hash = hash * 23 + EntityId.GetHashCode();
            hash = hash * 23 + DateId.GetHashCode();
            return hash;
        }
    }
}
