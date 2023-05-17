using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class TokenDTO
    {
        [Required]
        public Guid IndicatorId { get; set; }

        [Required]
        public short TokenNumber { get; set; }

        [Required]
        public TokenType TokenType { get; set; }

        public decimal? Number { get; set; }

        public OperatorType? OperatorType { get; set; }

        public ParenthesisType? ParenthesisType { get; set; }

        public Guid? SourceIndicatorId { get; set; }

        public bool? ConvertNullToZero { get; set; }

        public IndicatorDTO Indicator { get; set; }

        public IndicatorDTO SourceIndicator { get; set; }

    }

    public static partial class ModelFactory
    {
        public static TokenDTO Create(Token token, bool includeParents = true, bool includeChildren = false)
        {
            if (token == null) return null;

            var tokenDTO = new TokenDTO();

            tokenDTO.IndicatorId = token.IndicatorId;
            tokenDTO.TokenNumber = token.TokenNumber;
            tokenDTO.TokenType = token.TokenType;
            tokenDTO.Number = token.Number;
            tokenDTO.OperatorType = token.OperatorType;
            tokenDTO.ParenthesisType = token.ParenthesisType;
            tokenDTO.SourceIndicatorId = token.SourceIndicatorId;
            tokenDTO.ConvertNullToZero = token.ConvertNullToZero;

            if (includeParents)
            {
                tokenDTO.Indicator = Create(token.Indicator);
                tokenDTO.SourceIndicator = Create(token.SourceIndicator);
            }

            return tokenDTO;
        }

        public static void Hydrate(Token token, TokenDTO tokenDTO)
        {
            token.TokenType = tokenDTO.TokenType;
            token.Number = tokenDTO.Number;
            token.OperatorType = tokenDTO.OperatorType;
            token.ParenthesisType = tokenDTO.ParenthesisType;
            token.SourceIndicatorId = tokenDTO.SourceIndicatorId;
            token.ConvertNullToZero = tokenDTO.ConvertNullToZero;
        }
    }
}
