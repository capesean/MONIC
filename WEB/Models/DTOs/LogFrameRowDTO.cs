using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class LogFrameRowDTO
    {
        [Required]
        public Guid LogFrameRowId { get; set; }

        [Required]
        public Guid LogFrameId { get; set; }

        [Required]
        public int RowNumber { get; set; }

        [Required]
        public LogFrameRowType RowType { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string Description { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string Indicators { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string MeansOfVerification { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string RisksAndAssumptions { get; set; }

        public LogFrameDTO LogFrame { get; set; }

        public virtual List<LogFrameRowComponentDTO> LogFrameRowComponents { get; set; } = new List<LogFrameRowComponentDTO>();

        public virtual List<LogFrameRowIndicatorDTO> LogFrameRowIndicators { get; set; } = new List<LogFrameRowIndicatorDTO>();

    }

    public static partial class ModelFactory
    {
        public static LogFrameRowDTO Create(LogFrameRow logFrameRow, bool includeParents = true, bool includeChildren = false)
        {
            if (logFrameRow == null) return null;

            var logFrameRowDTO = new LogFrameRowDTO();

            logFrameRowDTO.LogFrameRowId = logFrameRow.LogFrameRowId;
            logFrameRowDTO.LogFrameId = logFrameRow.LogFrameId;
            logFrameRowDTO.RowNumber = logFrameRow.RowNumber;
            logFrameRowDTO.RowType = logFrameRow.RowType;
            logFrameRowDTO.Description = logFrameRow.Description;
            logFrameRowDTO.Indicators = logFrameRow.Indicators;
            logFrameRowDTO.MeansOfVerification = logFrameRow.MeansOfVerification;
            logFrameRowDTO.RisksAndAssumptions = logFrameRow.RisksAndAssumptions;

            if (includeParents)
            {
                logFrameRowDTO.LogFrame = Create(logFrameRow.LogFrame);
            }

            if (includeChildren)
            {
                foreach (var logFrameRowComponent in logFrameRow.LogFrameRowComponents)
                    logFrameRowDTO.LogFrameRowComponents.Add(Create(logFrameRowComponent));
                foreach (var logFrameRowIndicator in logFrameRow.LogFrameRowIndicators)
                    logFrameRowDTO.LogFrameRowIndicators.Add(Create(logFrameRowIndicator));
            }

            return logFrameRowDTO;
        }

        public static void Hydrate(LogFrameRow logFrameRow, LogFrameRowDTO logFrameRowDTO)
        {
            logFrameRow.LogFrameId = logFrameRowDTO.LogFrameId;
            logFrameRow.RowNumber = logFrameRowDTO.RowNumber;
            logFrameRow.RowType = logFrameRowDTO.RowType;
            logFrameRow.Description = logFrameRowDTO.Description;
            logFrameRow.Indicators = logFrameRowDTO.Indicators;
            logFrameRow.MeansOfVerification = logFrameRowDTO.MeansOfVerification;
            logFrameRow.RisksAndAssumptions = logFrameRowDTO.RisksAndAssumptions;
        }
    }
}
