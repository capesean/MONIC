using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class DatumDTO
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public Guid EntityId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        public decimal? Value { get; set; }

        [MaxLength(250)]
        public string Note { get; set; }

        public bool Submitted { get; set; }

        public Guid? SubmitDataReviewId { get; set; }

        public bool Verified { get; set; }

        public Guid? VerifyDataReviewId { get; set; }

        public bool Approved { get; set; }

        public Guid? ApproveDataReviewId { get; set; }

        public Guid? RejectDataReviewId { get; set; }

        public bool Rejected { get; set; }

        public DataReviewDTO ApproveReview { get; set; }

        public DataReviewDTO RejectReview { get; set; }

        public DataReviewDTO SubmitReview { get; set; }

        public DataReviewDTO VerifyReview { get; set; }

        public DateDTO Date { get; set; }

        public EntityDTO Entity { get; set; }

        public IndicatorDTO Indicator { get; set; }

        public virtual List<DataReviewLinkDTO> DataReviewLinks { get; set; } = new List<DataReviewLinkDTO>();

    }

    public static partial class ModelFactory
    {
        public static DatumDTO Create(Datum datum, bool includeParents = true, bool includeChildren = false)
        {
            if (datum == null) return null;

            var datumDTO = new DatumDTO();

            datumDTO.IndicatorId = datum.IndicatorId;
            datumDTO.EntityId = datum.EntityId;
            datumDTO.DateId = datum.DateId;
            datumDTO.Value = datum.Value;
            datumDTO.Note = datum.Note;
            datumDTO.Submitted = datum.Submitted;
            datumDTO.SubmitDataReviewId = datum.SubmitDataReviewId;
            datumDTO.Verified = datum.Verified;
            datumDTO.VerifyDataReviewId = datum.VerifyDataReviewId;
            datumDTO.Approved = datum.Approved;
            datumDTO.ApproveDataReviewId = datum.ApproveDataReviewId;
            datumDTO.RejectDataReviewId = datum.RejectDataReviewId;
            datumDTO.Rejected = datum.Rejected;

            if (includeParents)
            {
                datumDTO.ApproveReview = Create(datum.ApproveReview);
                datumDTO.Date = Create(datum.Date);
                datumDTO.Entity = Create(datum.Entity);
                datumDTO.Indicator = Create(datum.Indicator);
                datumDTO.RejectReview = Create(datum.RejectReview);
                datumDTO.SubmitReview = Create(datum.SubmitReview);
                datumDTO.VerifyReview = Create(datum.VerifyReview);
            }

            if (includeChildren)
            {
                foreach (var dataReviewLink in datum.DataReviewLinks)
                    datumDTO.DataReviewLinks.Add(Create(dataReviewLink));
            }

            return datumDTO;
        }

        public static void Hydrate(Datum datum, DatumDTO datumDTO)
        {
            datum.Value = datumDTO.Value;
            datum.Note = datumDTO.Note;
        }
    }
}
