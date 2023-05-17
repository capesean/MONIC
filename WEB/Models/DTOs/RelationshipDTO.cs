using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class RelationshipDTO : FieldsDTO
    {
        [Required]
        public Guid RelationshipId { get; set; }

        [Required]
        public Guid TheoryOfChangeId { get; set; }

        [Required]
        public Guid SourceComponentId { get; set; }

        [Required]
        public Guid TargetComponentId { get; set; }

        [MaxLength(50)]
        public string Label { get; set; }

        public ComponentDTO SourceComponent { get; set; }

        public ComponentDTO TargetComponent { get; set; }

        public TheoryOfChangeDTO TheoryOfChange { get; set; }

    }

    public static partial class ModelFactory
    {
        public static RelationshipDTO Create(Relationship relationship, bool includeParents = true, bool includeChildren = false, Item item = null)
        {
            if (relationship == null) return null;

            var relationshipDTO = new RelationshipDTO();

            relationshipDTO.RelationshipId = relationship.RelationshipId;
            relationshipDTO.TheoryOfChangeId = relationship.TheoryOfChangeId;
            relationshipDTO.SourceComponentId = relationship.SourceComponentId;
            relationshipDTO.TargetComponentId = relationship.TargetComponentId;
            relationshipDTO.Label = relationship.Label;

            if (includeParents)
            {
                relationshipDTO.SourceComponent = Create(relationship.SourceComponent);
                relationshipDTO.TargetComponent = Create(relationship.TargetComponent);
                relationshipDTO.TheoryOfChange = Create(relationship.TheoryOfChange);
            }

            relationshipDTO.AddFields(item);

            return relationshipDTO;
        }

        public static void Hydrate(Relationship relationship, RelationshipDTO relationshipDTO)
        {
            relationship.TheoryOfChangeId = relationshipDTO.TheoryOfChangeId;
            relationship.SourceComponentId = relationshipDTO.SourceComponentId;
            relationship.TargetComponentId = relationshipDTO.TargetComponentId;
            relationship.Label = relationshipDTO.Label;
        }
    }
}
