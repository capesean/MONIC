using System;

namespace WEB.Models
{
    public partial class Token
    {
        public int Precedence
        {
            get
            {
                switch (OperatorType)
                {
                    case Models.OperatorType.Multiply:
                    case Models.OperatorType.Divide:
                        return 3;
                    case Models.OperatorType.Add:
                    case Models.OperatorType.Subtract:
                        return 2;
                    default:
                        throw new InvalidOperationException("Invalid Operator Type for Precedence.get");
                }
            }
        }

        public Associativeness Associativeness
        {
            get
            {
                switch (OperatorType)
                {
                    case Models.OperatorType.Add:
                    case Models.OperatorType.Subtract:
                    case Models.OperatorType.Multiply:
                    case Models.OperatorType.Divide:
                        return Associativeness.Left;
                    default:
                        throw new InvalidOperationException("Invalid Operator Type for Associativeness.get");
                }
            }
        }

        public override string ToString()
        {
            if (TokenType == TokenType.Operator)
            {
                if (OperatorType == Models.OperatorType.Add) return "+";
                if (OperatorType == Models.OperatorType.Subtract) return "-";
                if (OperatorType == Models.OperatorType.Divide) return "/";
                if (OperatorType == Models.OperatorType.Multiply) return "*";
            }
            if (TokenType == TokenType.Parenthesis)
            {
                if (ParenthesisType == Models.ParenthesisType.Open) return "(";
                if (ParenthesisType == Models.ParenthesisType.Close) return ")";
            }
            if (TokenType == TokenType.Number)
            {
                return Number.ToString();
            }
            if (TokenType == TokenType.Indicator) return "INDICATOR";
            return "?";
        }

        public string Validate()
        {
            if (TokenType == TokenType.Number)
            {
                if (!Number.HasValue) return "Invalid number value (null)";
                OperatorType = null;
                ParenthesisType = null;
                SourceIndicatorId = null; // could give a FK ref integrity error. detach token?
                ConvertNullToZero = null;
            }
            else if (TokenType == TokenType.Operator)
            {
                if (!OperatorType.HasValue) return "Invalid operator (null)";
                Number = null;
                ParenthesisType = null;
                SourceIndicatorId = null; // could give a FK ref integrity error. detach token?
                ConvertNullToZero = null;
            }
            else if (TokenType == TokenType.Parenthesis)
            {
                if (!ParenthesisType.HasValue) return "Invalid parenthesis (null)";
                Number = null;
                OperatorType = null;
                SourceIndicatorId = null; // could give a FK ref integrity error. detach token?
                ConvertNullToZero = null;
            }
            else if (TokenType == TokenType.Indicator)
            {
                if (!SourceIndicatorId.HasValue) return "Invalid indicator (null)";
                if (!ConvertNullToZero.HasValue) return "Convert Null To Zero has not been set";
                Number = null;
                OperatorType = null;
                ParenthesisType = null;
            }
            else
            {
                throw new ArgumentException("Invalid TokenType in Validate");
            }

            return null;
        }
    }
}
