using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class ComponentIndicatorDTO
    {
        [Required]
        public Guid ComponentId { get; set; }

        [Required]
        public Guid IndicatorId { get; set; }

        public ComponentDTO Component { get; set; }

        public IndicatorDTO Indicator { get; set; }

    }

    public static partial class ModelFactory
    {
        public static ComponentIndicatorDTO Create(ComponentIndicator componentIndicator, bool includeParents = true, bool includeChildren = false)
        {
            if (componentIndicator == null) return null;

            var componentIndicatorDTO = new ComponentIndicatorDTO();

            componentIndicatorDTO.ComponentId = componentIndicator.ComponentId;
            componentIndicatorDTO.IndicatorId = componentIndicator.IndicatorId;

            if (includeParents)
            {
                componentIndicatorDTO.Component = Create(componentIndicator.Component);
                componentIndicatorDTO.Indicator = Create(componentIndicator.Indicator);
            }

            return componentIndicatorDTO;
        }

        public static void Hydrate(ComponentIndicator componentIndicator, ComponentIndicatorDTO componentIndicatorDTO)
        {
        }
    }
}
