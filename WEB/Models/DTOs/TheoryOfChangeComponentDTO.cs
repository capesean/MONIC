using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class TheoryOfChangeComponentDTO
    {
        [Required]
        public Guid TheoryOfChangeId { get; set; }

        [Required]
        public Guid ComponentId { get; set; }

        public ComponentDTO Component { get; set; }

        public TheoryOfChangeDTO TheoryOfChange { get; set; }

    }

    public static partial class ModelFactory
    {
        public static TheoryOfChangeComponentDTO Create(TheoryOfChangeComponent theoryOfChangeComponent, bool includeParents = true, bool includeChildren = false)
        {
            if (theoryOfChangeComponent == null) return null;

            var theoryOfChangeComponentDTO = new TheoryOfChangeComponentDTO();

            theoryOfChangeComponentDTO.TheoryOfChangeId = theoryOfChangeComponent.TheoryOfChangeId;
            theoryOfChangeComponentDTO.ComponentId = theoryOfChangeComponent.ComponentId;

            if (includeParents)
            {
                theoryOfChangeComponentDTO.Component = Create(theoryOfChangeComponent.Component);
                theoryOfChangeComponentDTO.TheoryOfChange = Create(theoryOfChangeComponent.TheoryOfChange);
            }

            return theoryOfChangeComponentDTO;
        }

        public static void Hydrate(TheoryOfChangeComponent theoryOfChangeComponent, TheoryOfChangeComponentDTO theoryOfChangeComponentDTO)
        {
        }
    }
}
