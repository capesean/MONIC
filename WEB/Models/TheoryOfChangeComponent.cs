using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class TheoryOfChangeComponent
    {
        [Required]
        public Guid TheoryOfChangeId { get; set; }

        [Required]
        public Guid ComponentId { get; set; }

        [ForeignKey("ComponentId")]
        public virtual Component Component { get; set; }

        [ForeignKey("TheoryOfChangeId")]
        public virtual TheoryOfChange TheoryOfChange { get; set; }

        public TheoryOfChangeComponent()
        {
        }

        public override string ToString()
        {
            return Convert.ToString(ComponentId);
        }
    }
}
