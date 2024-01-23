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

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            LogFrameRowComponent other = (LogFrameRowComponent)obj;

            return LogFrameRowId == other.LogFrameRowId && ComponentId == other.ComponentId;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + LogFrameRowId.GetHashCode();
            hash = hash * 23 + ComponentId.GetHashCode();
            return hash;
        }
    }
}
