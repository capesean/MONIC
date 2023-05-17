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
    }
}
