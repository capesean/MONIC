using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class ResponseDTO
    {
        [Required]
        public Guid ResponseId { get; set; }

        [Required]
        public Guid QuestionnaireId { get; set; }

        [Required]
        public Guid EntityId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        [MaxLength(50)]
        public string PublicCode { get; set; }

        public DateTime? OpenFrom { get; set; }

        public DateTime? OpenTo { get; set; }

        public int? TotalQuestions { get; set; }

        public int? ApplicableQuestions { get; set; }

        public int? CompletedQuestions { get; set; }

        public DateTime? CreatedOnUtc { get; set; }

        public DateTime? LastAnsweredOnUtc { get; set; }

        public DateTime? SubmittedOnUtc { get; set; }

        public Guid? SubmittedById { get; set; }

        public bool Submitted { get; set; }

        public DateDTO Date { get; set; }

        public EntityDTO Entity { get; set; }

        public QuestionnaireDTO Questionnaire { get; set; }

        public UserDTO SubmittedBy { get; set; }

        public virtual List<AnswerDTO> Answers { get; set; } = new List<AnswerDTO>();

    }

    public static partial class ModelFactory
    {
        public static ResponseDTO Create(Response response, bool includeParents = true, bool includeChildren = false)
        {
            if (response == null) return null;

            var responseDTO = new ResponseDTO();

            responseDTO.ResponseId = response.ResponseId;
            responseDTO.QuestionnaireId = response.QuestionnaireId;
            responseDTO.EntityId = response.EntityId;
            responseDTO.DateId = response.DateId;
            responseDTO.PublicCode = response.PublicCode;
            responseDTO.OpenFrom = response.OpenFrom;
            responseDTO.OpenTo = response.OpenTo;
            responseDTO.TotalQuestions = response.TotalQuestions;
            responseDTO.ApplicableQuestions = response.ApplicableQuestions;
            responseDTO.CompletedQuestions = response.CompletedQuestions;
            responseDTO.CreatedOnUtc = response.CreatedOnUtc;
            responseDTO.LastAnsweredOnUtc = response.LastAnsweredOnUtc;
            responseDTO.SubmittedOnUtc = response.SubmittedOnUtc;
            responseDTO.SubmittedById = response.SubmittedById;
            responseDTO.Submitted = response.Submitted;

            if (includeParents)
            {
                responseDTO.Date = Create(response.Date);
                responseDTO.Entity = Create(response.Entity);
                responseDTO.Questionnaire = Create(response.Questionnaire);
                responseDTO.SubmittedBy = Create(response.SubmittedBy);
            }

            if (includeChildren)
            {
                foreach (var answer in response.Answers)
                    responseDTO.Answers.Add(Create(answer));
            }

            return responseDTO;
        }

        public static void Hydrate(Response response, ResponseDTO responseDTO)
        {
            response.QuestionnaireId = responseDTO.QuestionnaireId;
            response.EntityId = responseDTO.EntityId;
            response.DateId = responseDTO.DateId;
            response.PublicCode = responseDTO.PublicCode;
            response.OpenFrom = responseDTO.OpenFrom;
            response.OpenTo = responseDTO.OpenTo;
        }
    }
}
