using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class EntityTypeDTO
    {
        [Required]
        public Guid EntityTypeId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string Plural { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public virtual List<EntityDTO> Entities { get; set; } = new List<EntityDTO>();

        public virtual List<IndicatorDTO> Indicators { get; set; } = new List<IndicatorDTO>();

        public virtual List<QuestionnaireDTO> Questionnaires { get; set; } = new List<QuestionnaireDTO>();

    }

    public static partial class ModelFactory
    {
        public static EntityTypeDTO Create(EntityType entityType, bool includeParents = true, bool includeChildren = false)
        {
            if (entityType == null) return null;

            var entityTypeDTO = new EntityTypeDTO();

            entityTypeDTO.EntityTypeId = entityType.EntityTypeId;
            entityTypeDTO.Name = entityType.Name;
            entityTypeDTO.Plural = entityType.Plural;
            entityTypeDTO.SortOrder = entityType.SortOrder;

            if (includeChildren)
            {
                foreach (var entity in entityType.Entities)
                    entityTypeDTO.Entities.Add(Create(entity));
                foreach (var indicator in entityType.Indicators)
                    entityTypeDTO.Indicators.Add(Create(indicator));
                foreach (var questionnaire in entityType.Questionnaires)
                    entityTypeDTO.Questionnaires.Add(Create(questionnaire));
            }

            return entityTypeDTO;
        }

        public static void Hydrate(EntityType entityType, EntityTypeDTO entityTypeDTO)
        {
            entityType.Name = entityTypeDTO.Name;
            entityType.Plural = entityTypeDTO.Plural;
            entityType.SortOrder = entityTypeDTO.SortOrder;
        }
    }
}
