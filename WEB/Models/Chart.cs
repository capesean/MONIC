using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class Chart
    {
        [Key, Required]
        public Guid ChartId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(200)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true)]
        public string Settings { get; set; }

        public Chart()
        {
            ChartId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Chart other = (Chart)obj;

            return ChartId == other.ChartId;
        }

        public override int GetHashCode()
        {
            return ChartId.GetHashCode();
        }
    }
}
