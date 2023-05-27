using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class ComponentIndicator
    {
        [Required]
        public Guid ComponentId { get; set; }

        [Required]
        public Guid IndicatorId { get; set; }

        [ForeignKey("ComponentId")]
        public virtual Component Component { get; set; }

        [ForeignKey("IndicatorId")]
        public virtual Indicator Indicator { get; set; }

        public ComponentIndicator()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(IndicatorId);
        }
    }
}
