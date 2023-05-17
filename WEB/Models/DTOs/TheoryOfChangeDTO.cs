using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class TheoryOfChangeDTO
    {
        [Required]
        public Guid TheoryOfChangeId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        public virtual List<RelationshipDTO> Relationships { get; set; } = new List<RelationshipDTO>();

        public virtual List<TheoryOfChangeComponentDTO> TheoryOfChangeComponents { get; set; } = new List<TheoryOfChangeComponentDTO>();

    }

    public static partial class ModelFactory
    {
        public static TheoryOfChangeDTO Create(TheoryOfChange theoryOfChange, bool includeParents = true, bool includeChildren = false)
        {
            if (theoryOfChange == null) return null;

            var theoryOfChangeDTO = new TheoryOfChangeDTO();

            theoryOfChangeDTO.TheoryOfChangeId = theoryOfChange.TheoryOfChangeId;
            theoryOfChangeDTO.Name = theoryOfChange.Name;

            if (includeChildren)
            {
                foreach (var relationship in theoryOfChange.Relationships)
                    theoryOfChangeDTO.Relationships.Add(Create(relationship));
                foreach (var theoryOfChangeComponent in theoryOfChange.TheoryOfChangeComponents)
                    theoryOfChangeDTO.TheoryOfChangeComponents.Add(Create(theoryOfChangeComponent));
            }

            return theoryOfChangeDTO;
        }

        public static void Hydrate(TheoryOfChange theoryOfChange, TheoryOfChangeDTO theoryOfChangeDTO)
        {
            theoryOfChange.Name = theoryOfChangeDTO.Name;
        }
    }
}
