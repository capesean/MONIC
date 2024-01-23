using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class LogFrameRow
    {
        [Key, Required]
        public Guid LogFrameRowId { get; set; }

        [Required]
        public Guid LogFrameId { get; set; }

        [Required]
        public int RowNumber { get; set; }

        [Required]
        public LogFrameRowType RowType { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Description { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Indicators { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string MeansOfVerification { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string RisksAndAssumptions { get; set; }

        public virtual ICollection<LogFrameRowIndicator> LogFrameRowIndicators { get; set; } = new List<LogFrameRowIndicator>();

        public virtual ICollection<LogFrameRowComponent> LogFrameRowComponents { get; set; } = new List<LogFrameRowComponent>();

        [ForeignKey("LogFrameId")]
        public virtual LogFrame LogFrame { get; set; }

        public LogFrameRow()
        {
            LogFrameRowId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Convert.ToString(RowNumber);
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            LogFrameRow other = (LogFrameRow)obj;

            return LogFrameRowId == other.LogFrameRowId;
        }

        public override int GetHashCode()
        {
            return LogFrameRowId.GetHashCode();
        }
    }
}
