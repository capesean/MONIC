using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class IndicatorDateDTO
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        public DateDTO Date { get; set; }

        public IndicatorDTO Indicator { get; set; }

    }

    public static partial class ModelFactory
    {
        public static IndicatorDateDTO Create(IndicatorDate indicatorDate, bool includeParents = true, bool includeChildren = false)
        {
            if (indicatorDate == null) return null;

            var indicatorDateDTO = new IndicatorDateDTO();

            indicatorDateDTO.IndicatorId = indicatorDate.IndicatorId;
            indicatorDateDTO.DateId = indicatorDate.DateId;

            if (includeParents)
            {
                indicatorDateDTO.Date = Create(indicatorDate.Date);
                indicatorDateDTO.Indicator = Create(indicatorDate.Indicator);
            }

            return indicatorDateDTO;
        }

        public static void Hydrate(IndicatorDate indicatorDate, IndicatorDateDTO indicatorDateDTO)
        {
        }
    }
}
