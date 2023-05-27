using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class ComponentDTO : FieldsDTO
    {
        [Required]
        public Guid ComponentId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(20)]
        public string Code { get; set; }

        [Required]
        public ComponentType ComponentType { get; set; }

        public string Description { get; set; }

        [MaxLength(7)]
        public string BackgroundColour { get; set; }

        [MaxLength(7)]
        public string TextColour { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual List<ComponentIndicatorDTO> ComponentIndicators { get; set; } = new List<ComponentIndicatorDTO>();

        public virtual List<LogFrameRowComponentDTO> LogFrameRowComponents { get; set; } = new List<LogFrameRowComponentDTO>();

        public virtual List<RelationshipDTO> RelationshipsAsSource { get; set; } = new List<RelationshipDTO>();

        public virtual List<RelationshipDTO> RelationshipsAsTarget { get; set; } = new List<RelationshipDTO>();

        public virtual List<TheoryOfChangeComponentDTO> TheoryOfChangeComponents { get; set; } = new List<TheoryOfChangeComponentDTO>();

    }

    public static partial class ModelFactory
    {
        public static ComponentDTO Create(Component component, bool includeParents = true, bool includeChildren = false, Item item = null)
        {
            if (component == null) return null;

            var componentDTO = new ComponentDTO();

            componentDTO.ComponentId = component.ComponentId;
            componentDTO.Name = component.Name;
            componentDTO.Code = component.Code;
            componentDTO.ComponentType = component.ComponentType;
            componentDTO.Description = component.Description;
            componentDTO.BackgroundColour = component.BackgroundColour;
            componentDTO.TextColour = component.TextColour;
            componentDTO.SortOrder = component.SortOrder;

            if (includeChildren)
            {
                foreach (var componentIndicator in component.ComponentIndicators)
                    componentDTO.ComponentIndicators.Add(Create(componentIndicator));
                foreach (var logFrameRowComponent in component.LogFrameRowComponents)
                    componentDTO.LogFrameRowComponents.Add(Create(logFrameRowComponent));
                foreach (var relationshipAsSource in component.RelationshipsAsSource)
                    componentDTO.RelationshipsAsSource.Add(Create(relationshipAsSource));
                foreach (var relationshipAsTarget in component.RelationshipsAsTarget)
                    componentDTO.RelationshipsAsTarget.Add(Create(relationshipAsTarget));
                foreach (var theoryOfChangeComponent in component.TheoryOfChangeComponents)
                    componentDTO.TheoryOfChangeComponents.Add(Create(theoryOfChangeComponent));
            }

            componentDTO.AddFields(item);

            return componentDTO;
        }

        public static void Hydrate(Component component, ComponentDTO componentDTO)
        {
            component.Name = componentDTO.Name;
            component.Code = componentDTO.Code;
            component.ComponentType = componentDTO.ComponentType;
            component.Description = componentDTO.Description;
            component.BackgroundColour = componentDTO.BackgroundColour;
            component.TextColour = componentDTO.TextColour;
            component.SortOrder = componentDTO.SortOrder;
        }
    }
}
