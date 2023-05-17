using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class DateDTO
    {
        [Required]
        public Guid DateId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(15)]
        public string Name { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(8)]
        public string Code { get; set; }

        [Required]
        public DateType DateType { get; set; }

        public Guid? QuarterId { get; set; }

        public Guid? YearId { get; set; }

        [Required, DateLessThan("OpenTo", ErrorMessage = "Open From date must be before the Open To date")]
        public DateTime OpenFrom { get; set; }

        [Required]
        public DateTime OpenTo { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public DateDTO Quarter { get; set; }

        public DateDTO Year { get; set; }

        public virtual List<DateDTO> DatesInQuarter { get; set; } = new List<DateDTO>();

        public virtual List<DateDTO> DatesInYear { get; set; } = new List<DateDTO>();

        public virtual List<DatumDTO> Data { get; set; } = new List<DatumDTO>();

        public virtual List<QuestionnaireDTO> DefaultDateQuestionnaires { get; set; } = new List<QuestionnaireDTO>();

        public virtual List<QuestionSummaryDTO> QuestionSummaries { get; set; } = new List<QuestionSummaryDTO>();

        public virtual List<ResponseDTO> Responses { get; set; } = new List<ResponseDTO>();

    }

    public static partial class ModelFactory
    {
        public static DateDTO Create(Date date, bool includeParents = true, bool includeChildren = false)
        {
            if (date == null) return null;

            var dateDTO = new DateDTO();

            dateDTO.DateId = date.DateId;
            dateDTO.Name = date.Name;
            dateDTO.Code = date.Code;
            dateDTO.DateType = date.DateType;
            dateDTO.QuarterId = date.QuarterId;
            dateDTO.YearId = date.YearId;
            dateDTO.OpenFrom = date.OpenFrom;
            dateDTO.OpenTo = date.OpenTo;
            dateDTO.SortOrder = date.SortOrder;

            if (includeParents)
            {
                dateDTO.Quarter = Create(date.Quarter);
                dateDTO.Year = Create(date.Year);
            }

            if (includeChildren)
            {
                foreach (var datum in date.Data)
                    dateDTO.Data.Add(Create(datum));
                foreach (var dateInQuarter in date.DatesInQuarter)
                    dateDTO.DatesInQuarter.Add(Create(dateInQuarter));
                foreach (var dateInYear in date.DatesInYear)
                    dateDTO.DatesInYear.Add(Create(dateInYear));
                foreach (var questionnaire in date.DefaultDateQuestionnaires)
                    dateDTO.DefaultDateQuestionnaires.Add(Create(questionnaire));
                foreach (var questionSummary in date.QuestionSummaries)
                    dateDTO.QuestionSummaries.Add(Create(questionSummary));
                foreach (var response in date.Responses)
                    dateDTO.Responses.Add(Create(response));
            }

            return dateDTO;
        }

        public static void Hydrate(Date date, DateDTO dateDTO)
        {
            date.Name = dateDTO.Name;
            date.Code = dateDTO.Code;
            date.DateType = dateDTO.DateType;
            date.QuarterId = dateDTO.QuarterId;
            date.YearId = dateDTO.YearId;
            date.OpenFrom = dateDTO.OpenFrom;
            date.OpenTo = dateDTO.OpenTo;
            date.SortOrder = dateDTO.SortOrder;
        }
    }
}
