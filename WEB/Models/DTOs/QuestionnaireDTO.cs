using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class QuestionnaireDTO
    {
        [Required]
        public Guid QuestionnaireId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        [Required]
        public Guid EntityTypeId { get; set; }

        [Required]
        public DateType DateType { get; set; }

        public string CreationText { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string CompletionText { get; set; }

        [Required]
        public bool CalculateProgress { get; set; }

        [Required]
        public bool DisplayQuestionCode { get; set; }

        [Required]
        public bool ShowSections { get; set; }

        [MaxLength(50)]
        public string PublicCode { get; set; }

        [Required]
        public bool AllowMultiple { get; set; }

        public Guid? DefaultDateId { get; set; }

        [Required]
        public bool UseSubmit { get; set; }

        [Required]
        public bool SubmitOnCompletion { get; set; }

        public DateDTO Date { get; set; }

        public EntityTypeDTO EntityType { get; set; }

        public virtual List<ResponseDTO> Responses { get; set; } = new List<ResponseDTO>();

        public virtual List<SectionDTO> Sections { get; set; } = new List<SectionDTO>();

    }

    public static partial class ModelFactory
    {
        public static QuestionnaireDTO Create(Questionnaire questionnaire, bool includeParents = true, bool includeChildren = false)
        {
            if (questionnaire == null) return null;

            var questionnaireDTO = new QuestionnaireDTO();

            questionnaireDTO.QuestionnaireId = questionnaire.QuestionnaireId;
            questionnaireDTO.Name = questionnaire.Name;
            questionnaireDTO.EntityTypeId = questionnaire.EntityTypeId;
            questionnaireDTO.DateType = questionnaire.DateType;
            questionnaireDTO.CreationText = questionnaire.CreationText;
            questionnaireDTO.CompletionText = questionnaire.CompletionText;
            questionnaireDTO.CalculateProgress = questionnaire.CalculateProgress;
            questionnaireDTO.DisplayQuestionCode = questionnaire.DisplayQuestionCode;
            questionnaireDTO.ShowSections = questionnaire.ShowSections;
            questionnaireDTO.PublicCode = questionnaire.PublicCode;
            questionnaireDTO.AllowMultiple = questionnaire.AllowMultiple;
            questionnaireDTO.DefaultDateId = questionnaire.DefaultDateId;
            questionnaireDTO.UseSubmit = questionnaire.UseSubmit;
            questionnaireDTO.SubmitOnCompletion = questionnaire.SubmitOnCompletion;

            if (includeParents)
            {
                questionnaireDTO.Date = Create(questionnaire.Date);
                questionnaireDTO.EntityType = Create(questionnaire.EntityType);
            }

            if (includeChildren)
            {
                foreach (var response in questionnaire.Responses)
                    questionnaireDTO.Responses.Add(Create(response));
                foreach (var section in questionnaire.Sections)
                    questionnaireDTO.Sections.Add(Create(section));
            }

            return questionnaireDTO;
        }

        public static void Hydrate(Questionnaire questionnaire, QuestionnaireDTO questionnaireDTO)
        {
            questionnaire.Name = questionnaireDTO.Name;
            questionnaire.EntityTypeId = questionnaireDTO.EntityTypeId;
            questionnaire.DateType = questionnaireDTO.DateType;
            questionnaire.CreationText = questionnaireDTO.CreationText;
            questionnaire.CompletionText = questionnaireDTO.CompletionText;
            questionnaire.CalculateProgress = questionnaireDTO.CalculateProgress;
            questionnaire.DisplayQuestionCode = questionnaireDTO.DisplayQuestionCode;
            questionnaire.ShowSections = questionnaireDTO.ShowSections;
            questionnaire.PublicCode = questionnaireDTO.PublicCode;
            questionnaire.AllowMultiple = questionnaireDTO.AllowMultiple;
            questionnaire.DefaultDateId = questionnaireDTO.DefaultDateId;
            questionnaire.UseSubmit = questionnaireDTO.UseSubmit;
            questionnaire.SubmitOnCompletion = questionnaireDTO.SubmitOnCompletion;
        }
    }
}
