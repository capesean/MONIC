using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class LogFrameRowIndicator
    {
        [Required]
        public Guid LogFrameRowId { get; set; }

        [Required]
        public Guid IndicatorId { get; set; }

        [ForeignKey("IndicatorId")]
        public virtual Indicator Indicator { get; set; }

        [ForeignKey("LogFrameRowId")]
        public virtual LogFrameRow LogFrameRow { get; set; }

        public LogFrameRowIndicator()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(IndicatorId);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            LogFrameRowIndicator other = (LogFrameRowIndicator)obj;

            return LogFrameRowId == other.LogFrameRowId && IndicatorId == other.IndicatorId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + LogFrameRowId.GetHashCode();
            hash = hash * 23 + IndicatorId.GetHashCode();
            return hash;
        }
    }
}
