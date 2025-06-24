using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class IndicatorDate
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        [ForeignKey("DateId")]
        public virtual Date Date { get; set; }

        [ForeignKey("IndicatorId")]
        public virtual Indicator Indicator { get; set; }

        public IndicatorDate()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(DateId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            IndicatorDate other = (IndicatorDate)obj;

            return IndicatorId == other.IndicatorId && DateId == other.DateId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + IndicatorId.GetHashCode();
            hash = hash * 23 + DateId.GetHashCode();
            return hash;
        }
    }
}
