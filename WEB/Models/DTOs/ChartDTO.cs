using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class ChartDTO
    {
        [Required]
        public Guid ChartId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(200)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string Settings { get; set; }

    }

    public static partial class ModelFactory
    {
        public static ChartDTO Create(Chart chart, bool includeParents = true, bool includeChildren = false)
        {
            if (chart == null) return null;

            var chartDTO = new ChartDTO();

            chartDTO.ChartId = chart.ChartId;
            chartDTO.Name = chart.Name;
            chartDTO.Settings = chart.Settings;

            return chartDTO;
        }

        public static void Hydrate(Chart chart, ChartDTO chartDTO)
        {
            chart.Name = chartDTO.Name;
            chart.Settings = chartDTO.Settings;
        }
    }
}
