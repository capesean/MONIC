using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class IndicatorDTO : FieldsDTO
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public Guid SubcategoryId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(500)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(20)]
        public string Code { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(100)]
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
        public bool LowerIsBetter { get; set; }

        [Required]
        public bool UseIndicatorDates { get; set; }

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

        public decimal? Minimum { get; set; }

        public decimal? Maximum { get; set; }

        [MaxLength(250)]
        public string ShortName { get; set; }

        [MaxLength(50)]
        public string Label { get; set; }

        [MaxLength(7)]
        public string Color { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(10)]
        public string Prefix { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(10)]
        public string Suffix { get; set; }

        public Guid? GroupingIndicatorId { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public EntityTypeDTO EntityType { get; set; }

        public IndicatorDTO GroupingIndicator { get; set; }

        public OptionListDTO OptionList { get; set; }

        public SubcategoryDTO Subcategory { get; set; }

        public virtual List<ComponentIndicatorDTO> ComponentIndicators { get; set; } = new List<ComponentIndicatorDTO>();

        public virtual List<DatumDTO> Data { get; set; } = new List<DatumDTO>();

        public virtual List<IndicatorDTO> GroupIndicators { get; set; } = new List<IndicatorDTO>();

        public virtual List<IndicatorDateDTO> IndicatorDates { get; set; } = new List<IndicatorDateDTO>();

        public virtual List<IndicatorPermissionDTO> IndicatorPermissions { get; set; } = new List<IndicatorPermissionDTO>();

        public virtual List<LogFrameRowIndicatorDTO> LogFrameRowIndicators { get; set; } = new List<LogFrameRowIndicatorDTO>();

        public virtual List<TokenDTO> SourceTokens { get; set; } = new List<TokenDTO>();

        public virtual List<TokenDTO> Tokens { get; set; } = new List<TokenDTO>();

    }

    public static partial class ModelFactory
    {
        public static IndicatorDTO Create(Indicator indicator, bool includeParents = true, bool includeChildren = false, Item item = null)
        {
            if (indicator == null) return null;

            var indicatorDTO = new IndicatorDTO();

            indicatorDTO.IndicatorId = indicator.IndicatorId;
            indicatorDTO.SubcategoryId = indicator.SubcategoryId;
            indicatorDTO.Name = indicator.Name;
            indicatorDTO.Code = indicator.Code;
            indicatorDTO.Units = indicator.Units;
            indicatorDTO.IndicatorType = indicator.IndicatorType;
            indicatorDTO.IndicatorStatus = indicator.IndicatorStatus;
            indicatorDTO.RequiresSubmit = indicator.RequiresSubmit;
            indicatorDTO.RequiresVerify = indicator.RequiresVerify;
            indicatorDTO.RequiresApprove = indicator.RequiresApprove;
            indicatorDTO.LowerIsBetter = indicator.LowerIsBetter;
            indicatorDTO.UseIndicatorDates = indicator.UseIndicatorDates;
            indicatorDTO.DisableNote = indicator.DisableNote;
            indicatorDTO.EntityTypeId = indicator.EntityTypeId;
            indicatorDTO.Frequency = indicator.Frequency;
            indicatorDTO.DateAggregationType = indicator.DateAggregationType;
            indicatorDTO.DataType = indicator.DataType;
            indicatorDTO.OptionListId = indicator.OptionListId;
            indicatorDTO.DecimalPlaces = indicator.DecimalPlaces;
            indicatorDTO.Minimum = indicator.Minimum;
            indicatorDTO.Maximum = indicator.Maximum;
            indicatorDTO.ShortName = indicator.ShortName;
            indicatorDTO.Label = indicator.Label;
            indicatorDTO.Color = indicator.Color;
            indicatorDTO.Prefix = indicator.Prefix;
            indicatorDTO.Suffix = indicator.Suffix;
            indicatorDTO.GroupingIndicatorId = indicator.GroupingIndicatorId;
            indicatorDTO.SortOrder = indicator.SortOrder;

            if (includeParents)
            {
                indicatorDTO.EntityType = Create(indicator.EntityType);
                indicatorDTO.GroupingIndicator = Create(indicator.GroupingIndicator);
                indicatorDTO.OptionList = Create(indicator.OptionList);
                indicatorDTO.Subcategory = Create(indicator.Subcategory);
            }

            if (includeChildren)
            {
                foreach (var componentIndicator in indicator.ComponentIndicators)
                    indicatorDTO.ComponentIndicators.Add(Create(componentIndicator));
                foreach (var datum in indicator.Data)
                    indicatorDTO.Data.Add(Create(datum));
                foreach (var groupIndicator in indicator.GroupIndicators)
                    indicatorDTO.GroupIndicators.Add(Create(groupIndicator));
                foreach (var indicatorDate in indicator.IndicatorDates)
                    indicatorDTO.IndicatorDates.Add(Create(indicatorDate));
                foreach (var indicatorPermission in indicator.IndicatorPermissions)
                    indicatorDTO.IndicatorPermissions.Add(Create(indicatorPermission));
                foreach (var logFrameRowIndicator in indicator.LogFrameRowIndicators)
                    indicatorDTO.LogFrameRowIndicators.Add(Create(logFrameRowIndicator));
                foreach (var sourceToken in indicator.SourceTokens)
                    indicatorDTO.SourceTokens.Add(Create(sourceToken));
                foreach (var token in indicator.Tokens)
                    indicatorDTO.Tokens.Add(Create(token));
            }

            indicatorDTO.AddFields(item);

            return indicatorDTO;
        }

        public static void Hydrate(Indicator indicator, IndicatorDTO indicatorDTO, bool isNew)
        {
            indicator.SubcategoryId = indicatorDTO.SubcategoryId;
            indicator.Name = indicatorDTO.Name;
            indicator.Code = indicatorDTO.Code;
            indicator.Units = indicatorDTO.Units;
            if (isNew) indicator.IndicatorType = indicatorDTO.IndicatorType;
            indicator.IndicatorStatus = indicatorDTO.IndicatorStatus;
            indicator.RequiresSubmit = indicatorDTO.RequiresSubmit;
            indicator.RequiresVerify = indicatorDTO.RequiresVerify;
            indicator.RequiresApprove = indicatorDTO.RequiresApprove;
            indicator.LowerIsBetter = indicatorDTO.LowerIsBetter;
            indicator.UseIndicatorDates = indicatorDTO.UseIndicatorDates;
            indicator.DisableNote = indicatorDTO.DisableNote;
            if (isNew) indicator.EntityTypeId = indicatorDTO.EntityTypeId;
            if (isNew) indicator.Frequency = indicatorDTO.Frequency;
            if (isNew) indicator.DateAggregationType = indicatorDTO.DateAggregationType;
            indicator.DataType = indicatorDTO.DataType;
            indicator.OptionListId = indicatorDTO.OptionListId;
            indicator.DecimalPlaces = indicatorDTO.DecimalPlaces;
            indicator.Minimum = indicatorDTO.Minimum;
            indicator.Maximum = indicatorDTO.Maximum;
            indicator.ShortName = indicatorDTO.ShortName;
            indicator.Label = indicatorDTO.Label;
            indicator.Color = indicatorDTO.Color;
            indicator.Prefix = indicatorDTO.Prefix;
            indicator.Suffix = indicatorDTO.Suffix;
            indicator.GroupingIndicatorId = indicatorDTO.GroupingIndicatorId;
            indicator.SortOrder = indicatorDTO.SortOrder;
        }
    }
}
