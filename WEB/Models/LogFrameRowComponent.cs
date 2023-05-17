using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class LogFrameRowComponent
    {
        [Required]
        public Guid LogFrameRowId { get; set; }

        [Required]
        public Guid ComponentId { get; set; }

        [ForeignKey("ComponentId")]
        public virtual Component Component { get; set; }

        [ForeignKey("LogFrameRowId")]
        public virtual LogFrameRow LogFrameRow { get; set; }

        public LogFrameRowComponent()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(ComponentId);
        }
    }
}
