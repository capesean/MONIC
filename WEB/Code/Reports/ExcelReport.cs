using System.Drawing;
using WEB.Models;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace WEB.Reports.Excel
{
    public abstract partial class ExcelReports
    {
        protected ApplicationDbContext db;
        protected const string ExcelContentType = "application/ms-excel";
        protected AppSettings appSettings;
        protected string LongDateFormat = "dd MMMM yyyy";
        protected string PercentFormat = "#0.0%";
        protected string PercentFormatNoDecimals = "#0%";

        public ExcelReports(ApplicationDbContext db, AppSettings appSettings)
        {
            this.db = db;
            this.appSettings = appSettings;
        }

        abstract public Task<byte[]> GenerateAsync();
        abstract public string GetReportName();
        abstract public string GetContentType();
        public System.Net.Mime.ContentDisposition GetContentDisposition()
        {
            return new System.Net.Mime.ContentDisposition
            {
                FileName = string.Format(GetReportName()),
                Inline = false,
            };
        }

        protected string GetExcelColumnName(int columnNumber)
        {
            int dividend = columnNumber;
            string columnName = String.Empty;
            int modulo;

            while (dividend > 0)
            {
                modulo = (dividend - 1) % 26;
                columnName = Convert.ToChar(65 + modulo).ToString() + columnName;
                dividend = (int)((dividend - modulo) / 26);
            }

            return columnName;
        }

    }

    public static partial class ExcelExtensions
    {
        public enum CellStyle { Header, Label, RowTitle, RowTotal, Calculated, Hyperlink }

        public enum BorderType
        {
            All,
            Left,
            Top,
            Right,
            Bottom,
            Outline
        }

        public static ExcelRange SetValue(this ExcelRange range, object value)
        {
            range.Value = value;
            return range;
        }

        public static ExcelRange SetStyle(this ExcelRange range, CellStyle cellStyle)
        {
            if (cellStyle == CellStyle.Header)
                return range.SetBackgroundColor(Color.DarkGray)
                    .SetFontColor(Color.White)
                    .SetBorder();

            if (cellStyle == CellStyle.RowTotal)
                return range.SetBackgroundColor(Color.Gray)
                    .SetFontColor(Color.White)
                    .SetBorder();

            if (cellStyle == CellStyle.RowTitle)
                return range.SetBackgroundColor(Color.LightGray)
                    .SetBorder();

            if (cellStyle == CellStyle.Label)
                return range;

            if (cellStyle == CellStyle.Calculated)
            {
                range.Style.Font.Bold = true;
                return range.SetBackgroundColor(Color.LightGray)
                    .SetBorder()
                    .SetFontColor(ColorTranslator.FromHtml("#FA7D00"));
            }

            if (cellStyle == CellStyle.Hyperlink)
            {
                range.Style.Font.UnderLine = true;
                return range.SetFontColor(Color.Blue);
            }

            throw new NotImplementedException("Invalid cellStyle in ExcelExtensions.FormatAs");
        }

        public static ExcelRange SetBackgroundColor(this ExcelRange range, Color color)
        {
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(color);
            return range;
        }

        public static ExcelRange SetFontColor(this ExcelRange range, Color color)
        {
            range.Style.Font.Color.SetColor(color);
            return range;
        }

        public static ExcelRange SetFontWeight(this ExcelRange range, bool bold)
        {
            range.Style.Font.Bold = bold;
            return range;
        }

        public static ExcelRange SetBorder(this ExcelRange range, BorderType border = BorderType.All, ExcelBorderStyle style = ExcelBorderStyle.Thin, Color? color = null)
        {
            if (border == BorderType.Top || border == BorderType.All)
            {
                range.Style.Border.Top.Style = style;
                if (color.HasValue) range.Style.Border.Top.Color.SetColor(color.Value);
            }
            if (border == BorderType.Right || border == BorderType.All)
            {
                range.Style.Border.Right.Style = style;
                if (color.HasValue) range.Style.Border.Right.Color.SetColor(color.Value);
            }
            if (border == BorderType.Bottom || border == BorderType.All)
            {
                range.Style.Border.Bottom.Style = style;
                if (color.HasValue) range.Style.Border.Bottom.Color.SetColor(color.Value);
            }
            if (border == BorderType.Left || border == BorderType.All)
            {
                range.Style.Border.Left.Style = style;
                if (color.HasValue) range.Style.Border.Left.Color.SetColor(color.Value);
            }
            if (border == BorderType.Outline)
            {
                if (color.HasValue) range.Style.Border.BorderAround(style, color.Value);
                else range.Style.Border.BorderAround(style);
            }
            return range;
        }

        public static ExcelRange SetNumberFormat(this ExcelRange range, string format)
        {
            range.Style.Numberformat.Format = format;
            return range;
        }

        public static ExcelRange SetFormula(this ExcelRange range, string formula)
        {
            range.Formula = formula;
            return range;
        }

        public static ExcelRange SetVerticalAlignment(this ExcelRange range, ExcelVerticalAlignment alignment)
        {
            range.Style.VerticalAlignment = alignment;
            return range;
        }

        public static ExcelRange SetHorizontalAlignment(this ExcelRange range, ExcelHorizontalAlignment alignment)
        {
            range.Style.HorizontalAlignment = alignment;
            return range;
        }

        public static ExcelRange Merge(this ExcelRange range, int numberOfRows, int numberOfColumns)
        {
            range[range.Start.Row, range.Start.Column, range.Start.Row + numberOfRows - 1, range.Start.Column + numberOfColumns - 1].Merge = true;
            return range;
        }

    }
}