using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace WEB.Models
{
    public static partial class ExtensionMethods
    {
        public static string ToShortCode(this Guid value)
        {
            return Regex.Replace(Convert.ToBase64String(value.ToByteArray()), "[/+=]", "");
        }

        public static IQueryable<Document> SelectExcludingContent(this IQueryable<Document> query)
        {
            return query.Select(o => new Document { DocumentId = o.DocumentId, FileName = o.FileName, ItemId = o.ItemId, Notes = o.Notes, UploadedById = o.UploadedById, UploadedOn = o.UploadedOn, Size = o.Size, UploadedBy = o.UploadedBy });
        }

        public static IQueryable<FolderContent> SelectExcludingContent(this IQueryable<FolderContent> query)
        {
            return query.Select(o => new FolderContent { AddedBy = o.AddedBy, AddedById = o.AddedById, AddedOn = o.AddedOn, Folder = o.Folder, FolderId = o.FolderId, FolderContentId = o.FolderContentId, Name = o.Name, Html = null });
        }

        //public static string Text(this Datum datum, Element element)
        //{
        //    if (datum == null || datum.Value == null) return string.Empty;
        //    if (element.DataType == DataType.Date) return new DateTime((long)datum.Value.Value * 1000000, DateTimeKind.Utc).ToString("dd MMMM yyyy");
        //    return string.Format("{0:#,##0.######}", datum.Value);
        //}

        //public static string GetRoleName(this Roles role)
        //{
        //    if (role == Roles.Administrator) return "System Administrator";
        //    if (role == Roles.Reports) return "Reports";
        //    if (role == Roles.OrganisationManager) return "Manager";
        //    throw new ArgumentException("Invalid role in EnumExtensions.RoleName: " + role.ToString());
        //}

        //public static string AsText(this IEnumerable<Token> tokens, bool useCode = false, bool useName = true, bool formatNumbers = true)
        //{
        //    // todo: override the ToString of each token, then just .Aggregate() the string values
        //    var formula = string.Empty;
        //    foreach (var token in tokens)
        //    {
        //        if (formula != string.Empty) formula += " ";
        //        if (token.TokenType == TokenType.Element) formula = formula += (useCode ? token.Element.Code : string.Empty) + (useCode && useName ? ": " : "") + (useName ? token.Element.Name : string.Empty);
        //        else if (token.TokenType == TokenType.Number) formula = formula += (formatNumbers ? string.Format("{0:#,##0.#}", token.Number) : Convert.ToString(token.Number));
        //        else if (token.TokenType == TokenType.Operator) formula = formula += token.OperatorType.Value.AsText();
        //        else if (token.TokenType == TokenType.Parenthesis) formula = formula += token.ParenthesisType.Value.AsText();
        //    }
        //    return formula;
        //}

        //private static string AsText(this ParenthesisType paren)
        //{
        //    if (paren == ParenthesisType.Open) return "(";
        //    if (paren == ParenthesisType.Close) return ")";
        //    throw new NotImplementedException("Invalid ParenthesisType in ExtensionMethods.ParenthesisType.AsText");
        //}

        //internal static string AsText(this OperatorType op)
        //{
        //    if (op == OperatorType.Add) return "+";
        //    if (op == OperatorType.Subtract) return "-";
        //    if (op == OperatorType.Divide) return "/";
        //    if (op == OperatorType.Multiply) return "*";
        //    throw new NotImplementedException("Invalid OperatorType in ExtensionMethods.OperatorType.AsText");
        //}


    }
}