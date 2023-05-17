using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class SectionDTO
    {
        [Required]
        public Guid SectionId { get; set; }

        [Required]
        public Guid QuestionnaireId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        [Required]
        public bool CanNavigate { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public QuestionnaireDTO Questionnaire { get; set; }

        public virtual List<QuestionDTO> Questions { get; set; } = new List<QuestionDTO>();

    }

    public static partial class ModelFactory
    {
        public static SectionDTO Create(Section section, bool includeParents = true, bool includeChildren = false)
        {
            if (section == null) return null;

            var sectionDTO = new SectionDTO();

            sectionDTO.SectionId = section.SectionId;
            sectionDTO.QuestionnaireId = section.QuestionnaireId;
            sectionDTO.Name = section.Name;
            sectionDTO.CanNavigate = section.CanNavigate;
            sectionDTO.SortOrder = section.SortOrder;

            if (includeParents)
            {
                sectionDTO.Questionnaire = Create(section.Questionnaire);
            }

            if (includeChildren)
            {
                foreach (var question in section.Questions)
                    sectionDTO.Questions.Add(Create(question));
            }

            return sectionDTO;
        }

        public static void Hydrate(Section section, SectionDTO sectionDTO)
        {
            section.QuestionnaireId = sectionDTO.QuestionnaireId;
            section.Name = sectionDTO.Name;
            section.CanNavigate = sectionDTO.CanNavigate;
            section.SortOrder = sectionDTO.SortOrder;
        }
    }
}
