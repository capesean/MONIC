using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class LogFrameRowIndicatorDTO
    {
        [Required]
        public Guid LogFrameRowId { get; set; }

        [Required]
        public Guid IndicatorId { get; set; }

        public IndicatorDTO Indicator { get; set; }

        public LogFrameRowDTO LogFrameRow { get; set; }

    }

    public static partial class ModelFactory
    {
        public static LogFrameRowIndicatorDTO Create(LogFrameRowIndicator logFrameRowIndicator, bool includeParents = true, bool includeChildren = false)
        {
            if (logFrameRowIndicator == null) return null;

            var logFrameRowIndicatorDTO = new LogFrameRowIndicatorDTO();

            logFrameRowIndicatorDTO.LogFrameRowId = logFrameRowIndicator.LogFrameRowId;
            logFrameRowIndicatorDTO.IndicatorId = logFrameRowIndicator.IndicatorId;

            if (includeParents)
            {
                logFrameRowIndicatorDTO.Indicator = Create(logFrameRowIndicator.Indicator);
                logFrameRowIndicatorDTO.LogFrameRow = Create(logFrameRowIndicator.LogFrameRow);
            }

            return logFrameRowIndicatorDTO;
        }

        public static void Hydrate(LogFrameRowIndicator logFrameRowIndicator, LogFrameRowIndicatorDTO logFrameRowIndicatorDTO)
        {
        }
    }
}
