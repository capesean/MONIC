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

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
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
        public bool DisableNote { get; set; }

        [Required]
        public Guid EntityTypeId { get; set; }

        [Required]
        public DateType Frequency { get; set; }

        [Required]
        public AggregationType DateAggregationType { get; set; }

        [Required]
        public DataType DataType { get; set; }

        [Required]
        public byte DecimalPlaces { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public EntityTypeDTO EntityType { get; set; }

        public SubcategoryDTO Subcategory { get; set; }

        public virtual List<ComponentIndicatorDTO> ComponentIndicators { get; set; } = new List<ComponentIndicatorDTO>();

        public virtual List<DatumDTO> Data { get; set; } = new List<DatumDTO>();

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
            indicatorDTO.DisableNote = indicator.DisableNote;
            indicatorDTO.EntityTypeId = indicator.EntityTypeId;
            indicatorDTO.Frequency = indicator.Frequency;
            indicatorDTO.DateAggregationType = indicator.DateAggregationType;
            indicatorDTO.DataType = indicator.DataType;
            indicatorDTO.DecimalPlaces = indicator.DecimalPlaces;
            indicatorDTO.SortOrder = indicator.SortOrder;

            if (includeParents)
            {
                indicatorDTO.EntityType = Create(indicator.EntityType);
                indicatorDTO.Subcategory = Create(indicator.Subcategory);
            }

            if (includeChildren)
            {
                foreach (var componentIndicator in indicator.ComponentIndicators)
                    indicatorDTO.ComponentIndicators.Add(Create(componentIndicator));
                foreach (var datum in indicator.Data)
                    indicatorDTO.Data.Add(Create(datum));
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
            indicator.DisableNote = indicatorDTO.DisableNote;
            if (isNew) indicator.EntityTypeId = indicatorDTO.EntityTypeId;
            if (isNew) indicator.Frequency = indicatorDTO.Frequency;
            if (isNew) indicator.DateAggregationType = indicatorDTO.DateAggregationType;
            indicator.DataType = indicatorDTO.DataType;
            indicator.DecimalPlaces = indicatorDTO.DecimalPlaces;
            indicator.SortOrder = indicatorDTO.SortOrder;
        }
    }
}
