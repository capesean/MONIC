using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public partial class Token
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public short TokenNumber { get; set; }

        [Required]
        public TokenType TokenType { get; set; }

        [Column(TypeName = "decimal(20, 8)")]
        public decimal? Number { get; set; }

        public OperatorType? OperatorType { get; set; }

        public ParenthesisType? ParenthesisType { get; set; }

        public Guid? SourceIndicatorId { get; set; }

        public bool? ConvertNullToZero { get; set; }

        [ForeignKey("SourceIndicatorId")]
        public virtual Indicator SourceIndicator { get; set; }

        [ForeignKey("IndicatorId")]
        public virtual Indicator Indicator { get; set; }

        public Token()
        {
        }


        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            Token other = (Token)obj;

            return IndicatorId == other.IndicatorId && TokenNumber == other.TokenNumber;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + IndicatorId.GetHashCode();
            hash = hash * 23 + TokenNumber.GetHashCode();
            return hash;
        }
    }
}
