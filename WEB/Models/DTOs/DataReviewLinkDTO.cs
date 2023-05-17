using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class DataReviewLinkDTO
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public Guid EntityId { get; set; }

        [Required]
        public Guid DateId { get; set; }

        [Required]
        public Guid DataReviewId { get; set; }

        public DataReviewDTO DataReview { get; set; }

        public DatumDTO Datum { get; set; }

    }

    public static partial class ModelFactory
    {
        public static DataReviewLinkDTO Create(DataReviewLink dataReviewLink, bool includeParents = true, bool includeChildren = false)
        {
            if (dataReviewLink == null) return null;

            var dataReviewLinkDTO = new DataReviewLinkDTO();

            dataReviewLinkDTO.IndicatorId = dataReviewLink.IndicatorId;
            dataReviewLinkDTO.EntityId = dataReviewLink.EntityId;
            dataReviewLinkDTO.DateId = dataReviewLink.DateId;
            dataReviewLinkDTO.DataReviewId = dataReviewLink.DataReviewId;

            if (includeParents)
            {
                dataReviewLinkDTO.DataReview = Create(dataReviewLink.DataReview);
                dataReviewLinkDTO.Datum = Create(dataReviewLink.Datum);
            }

            return dataReviewLinkDTO;
        }

        public static void Hydrate(DataReviewLink dataReviewLink, DataReviewLinkDTO dataReviewLinkDTO)
        {
        }
    }
}
