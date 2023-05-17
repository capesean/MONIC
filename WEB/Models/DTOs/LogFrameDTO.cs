using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class LogFrameDTO
    {
        [Required]
        public Guid LogFrameId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(255)]
        public string Name { get; set; }

        public virtual List<LogFrameRowDTO> LogFrameRows { get; set; } = new List<LogFrameRowDTO>();

    }

    public static partial class ModelFactory
    {
        public static LogFrameDTO Create(LogFrame logFrame, bool includeParents = true, bool includeChildren = false)
        {
            if (logFrame == null) return null;

            var logFrameDTO = new LogFrameDTO();

            logFrameDTO.LogFrameId = logFrame.LogFrameId;
            logFrameDTO.Name = logFrame.Name;

            if (includeChildren)
            {
                foreach (var logFrameRow in logFrame.LogFrameRows)
                    logFrameDTO.LogFrameRows.Add(Create(logFrameRow));
            }

            return logFrameDTO;
        }

        public static void Hydrate(LogFrame logFrame, LogFrameDTO logFrameDTO)
        {
            logFrame.Name = logFrameDTO.Name;
        }
    }
}
