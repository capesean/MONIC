using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class LogFrame
    {
        [Key, Required]
        public Guid LogFrameId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(255)]
        public string Name { get; set; }

        public virtual ICollection<LogFrameRow> LogFrameRows { get; set; } = new List<LogFrameRow>();

        public LogFrame()
        {
            LogFrameId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
