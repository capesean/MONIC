using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class QuestionDTO
    {
        [Required]
        public Guid QuestionId { get; set; }

        [Required]
        public Guid SectionId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string Code { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string Text { get; set; }

        [Required]
        public QuestionType QuestionType { get; set; }

        public OptionListType? OptionListType { get; set; }

        public string Explanation { get; set; }

        [Required]
        public bool Required { get; set; }

        public Guid? QuestionOptionGroupId { get; set; }

        [Required]
        public byte MinimumDocuments { get; set; }

        [Required]
        public byte MaximumDocuments { get; set; }

        public Guid? CheckQuestionId { get; set; }

        [Required]
        public SkipLogicAction SkipLogicAction { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public QuestionDTO CheckQuestion { get; set; }

        public QuestionOptionGroupDTO QuestionOptionGroup { get; set; }

        public SectionDTO Section { get; set; }

        public virtual List<AnswerDTO> Answers { get; set; } = new List<AnswerDTO>();

        public virtual List<QuestionDTO> SkipLogicQuestions { get; set; } = new List<QuestionDTO>();

        public virtual List<QuestionSummaryDTO> QuestionSummaries { get; set; } = new List<QuestionSummaryDTO>();

        public virtual List<SkipLogicOptionDTO> SkipLogicOptions { get; set; } = new List<SkipLogicOptionDTO>();

    }

    public static partial class ModelFactory
    {
        public static QuestionDTO Create(Question question, bool includeParents = true, bool includeChildren = false)
        {
            if (question == null) return null;

            var questionDTO = new QuestionDTO();

            questionDTO.QuestionId = question.QuestionId;
            questionDTO.SectionId = question.SectionId;
            questionDTO.Code = question.Code;
            questionDTO.Text = question.Text;
            questionDTO.QuestionType = question.QuestionType;
            questionDTO.OptionListType = question.OptionListType;
            questionDTO.Explanation = question.Explanation;
            questionDTO.Required = question.Required;
            questionDTO.QuestionOptionGroupId = question.QuestionOptionGroupId;
            questionDTO.MinimumDocuments = question.MinimumDocuments;
            questionDTO.MaximumDocuments = question.MaximumDocuments;
            questionDTO.CheckQuestionId = question.CheckQuestionId;
            questionDTO.SkipLogicAction = question.SkipLogicAction;
            questionDTO.SortOrder = question.SortOrder;

            if (includeParents)
            {
                questionDTO.CheckQuestion = Create(question.CheckQuestion);
                questionDTO.QuestionOptionGroup = Create(question.QuestionOptionGroup);
                questionDTO.Section = Create(question.Section);
            }

            if (includeChildren)
            {
                foreach (var answer in question.Answers)
                    questionDTO.Answers.Add(Create(answer));
                foreach (var questionSummary in question.QuestionSummaries)
                    questionDTO.QuestionSummaries.Add(Create(questionSummary));
                foreach (var skipLogicOption in question.SkipLogicOptions)
                    questionDTO.SkipLogicOptions.Add(Create(skipLogicOption));
                foreach (var skipLogicQuestion in question.SkipLogicQuestions)
                    questionDTO.SkipLogicQuestions.Add(Create(skipLogicQuestion));
            }

            return questionDTO;
        }

        public static void Hydrate(Question question, QuestionDTO questionDTO)
        {
            question.SectionId = questionDTO.SectionId;
            question.Code = questionDTO.Code;
            question.Text = questionDTO.Text;
            question.QuestionType = questionDTO.QuestionType;
            question.OptionListType = questionDTO.OptionListType;
            question.Explanation = questionDTO.Explanation;
            question.Required = questionDTO.Required;
            question.QuestionOptionGroupId = questionDTO.QuestionOptionGroupId;
            question.MinimumDocuments = questionDTO.MinimumDocuments;
            question.MaximumDocuments = questionDTO.MaximumDocuments;
            question.CheckQuestionId = questionDTO.CheckQuestionId;
            question.SkipLogicAction = questionDTO.SkipLogicAction;
            question.SortOrder = questionDTO.SortOrder;
        }
    }
}
