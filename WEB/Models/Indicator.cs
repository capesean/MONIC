using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public partial class Indicator
    {
        [Key, Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public Guid SubcategoryId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(250)]
        public string Name { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(20)]
        public string Code { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(100)]
        public string Units { get; set; }

        [Required]
        public IndicatorType IndicatorType { get; set; }

        [Required]
        public IndicatorStatus IndicatorStatus { get; set; }

        [Required]
        public bool RequiresSubmit { get; set; }

        [Required]
        public bool RequiresVerify { get; set; }

        [Required]
        public bool RequiresApprove { get; set; }

        [Required]
        public bool DisableNote { get; set; }

        [Required]
        public Guid EntityTypeId { get; set; }

        [Required]
        public DateType Frequency { get; set; }

        [Required]
        public AggregationType DateAggregationType { get; set; }

        [Required]
        public DataType DataType { get; set; }

        public Guid? OptionListId { get; set; }

        [Required]
        public byte DecimalPlaces { get; set; }

        [Column(TypeName = "decimal(20, 8)")]
        public decimal? Minimum { get; set; }

        [Column(TypeName = "decimal(20, 8)")]
        public decimal? Maximum { get; set; }

        public Guid? GroupingIndicatorId { get; set; }

        [Required]
        public DateTime CreatedDateUtc { get; set; }

        [Required]
        public Guid CreatedById { get; set; }

        [Required]
        public DateTime LastSavedDateUtc { get; set; }

        [Required]
        public Guid LastSavedById { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual ICollection<Token> Tokens { get; set; } = new List<Token>();

        public virtual ICollection<Datum> Data { get; set; } = new List<Datum>();

        public virtual ICollection<Token> SourceTokens { get; set; } = new List<Token>();

        public virtual ICollection<IndicatorPermission> IndicatorPermissions { get; set; } = new List<IndicatorPermission>();

        public virtual ICollection<LogFrameRowIndicator> LogFrameRowIndicators { get; set; } = new List<LogFrameRowIndicator>();

        public virtual ICollection<ComponentIndicator> ComponentIndicators { get; set; } = new List<ComponentIndicator>();

        public virtual ICollection<Indicator> GroupIndicators { get; set; } = new List<Indicator>();

        [ForeignKey("EntityTypeId")]
        public virtual EntityType EntityType { get; set; }

        [ForeignKey("GroupingIndicatorId")]
        public virtual Indicator GroupingIndicator { get; set; }

        [ForeignKey("OptionListId")]
        public virtual OptionList OptionList { get; set; }

        [ForeignKey("SubcategoryId")]
        public virtual Subcategory Subcategory { get; set; }

        [ForeignKey("CreatedById")]
        public virtual User CreatedBy { get; set; }

        public Indicator()
        {
            IndicatorId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Indicator other = (Indicator)obj;

            return IndicatorId == other.IndicatorId;
        }

        public override int GetHashCode()
        {
            return IndicatorId.GetHashCode();
        }
    }
}
