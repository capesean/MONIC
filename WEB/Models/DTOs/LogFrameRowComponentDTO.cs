using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class LogFrameRowComponentDTO
    {
        [Required]
        public Guid LogFrameRowId { get; set; }

        [Required]
        public Guid ComponentId { get; set; }

        public ComponentDTO Component { get; set; }

        public LogFrameRowDTO LogFrameRow { get; set; }

    }

    public static partial class ModelFactory
    {
        public static LogFrameRowComponentDTO Create(LogFrameRowComponent logFrameRowComponent, bool includeParents = true, bool includeChildren = false)
        {
            if (logFrameRowComponent == null) return null;

            var logFrameRowComponentDTO = new LogFrameRowComponentDTO();

            logFrameRowComponentDTO.LogFrameRowId = logFrameRowComponent.LogFrameRowId;
            logFrameRowComponentDTO.ComponentId = logFrameRowComponent.ComponentId;

            if (includeParents)
            {
                logFrameRowComponentDTO.Component = Create(logFrameRowComponent.Component);
                logFrameRowComponentDTO.LogFrameRow = Create(logFrameRowComponent.LogFrameRow);
            }

            return logFrameRowComponentDTO;
        }

        public static void Hydrate(LogFrameRowComponent logFrameRowComponent, LogFrameRowComponentDTO logFrameRowComponentDTO)
        {
        }
    }
}
