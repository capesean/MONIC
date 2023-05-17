using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class DataReviewDTO
    {
        [Required]
        public Guid DataReviewId { get; set; }

        [Required]
        public DateTime DateUtc { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public ReviewStatus ReviewStatus { get; set; }

        [Required]
        public ReviewResult ReviewResult { get; set; }

        public string Note { get; set; }

        public UserDTO User { get; set; }

        public virtual List<DataReviewLinkDTO> DataReviewLinks { get; set; } = new List<DataReviewLinkDTO>();

        public virtual List<DatumDTO> ApprovedData { get; set; } = new List<DatumDTO>();

        public virtual List<DatumDTO> RejectedData { get; set; } = new List<DatumDTO>();

        public virtual List<DatumDTO> SubmittedData { get; set; } = new List<DatumDTO>();

        public virtual List<DatumDTO> VerifiedData { get; set; } = new List<DatumDTO>();

    }

    public static partial class ModelFactory
    {
        public static DataReviewDTO Create(DataReview dataReview, bool includeParents = true, bool includeChildren = false)
        {
            if (dataReview == null) return null;

            var dataReviewDTO = new DataReviewDTO();

            dataReviewDTO.DataReviewId = dataReview.DataReviewId;
            dataReviewDTO.DateUtc = dataReview.DateUtc;
            dataReviewDTO.UserId = dataReview.UserId;
            dataReviewDTO.ReviewStatus = dataReview.ReviewStatus;
            dataReviewDTO.ReviewResult = dataReview.ReviewResult;
            dataReviewDTO.Note = dataReview.Note;

            if (includeParents)
            {
                dataReviewDTO.User = Create(dataReview.User);
            }

            if (includeChildren)
            {
                foreach (var approvedDatum in dataReview.ApprovedData)
                    dataReviewDTO.ApprovedData.Add(Create(approvedDatum));
                foreach (var dataReviewLink in dataReview.DataReviewLinks)
                    dataReviewDTO.DataReviewLinks.Add(Create(dataReviewLink));
                foreach (var rejectedDatum in dataReview.RejectedData)
                    dataReviewDTO.RejectedData.Add(Create(rejectedDatum));
                foreach (var submittedDatum in dataReview.SubmittedData)
                    dataReviewDTO.SubmittedData.Add(Create(submittedDatum));
                foreach (var verifiedDatum in dataReview.VerifiedData)
                    dataReviewDTO.VerifiedData.Add(Create(verifiedDatum));
            }

            return dataReviewDTO;
        }

        public static void Hydrate(DataReview dataReview, DataReviewDTO dataReviewDTO)
        {
            dataReview.DateUtc = dataReviewDTO.DateUtc;
            dataReview.UserId = dataReviewDTO.UserId;
            dataReview.ReviewStatus = dataReviewDTO.ReviewStatus;
            dataReview.ReviewResult = dataReviewDTO.ReviewResult;
            dataReview.Note = dataReviewDTO.Note;
        }
    }
}
