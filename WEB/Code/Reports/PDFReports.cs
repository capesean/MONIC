using iTextSharp.text;
using iTextSharp.text.pdf;
using WEB.Models;
using Element = iTextSharp.text.Element;
using Document = iTextSharp.text.Document;

namespace WEB.Reports.PDF
{
    public abstract class PDFReports
    {
        protected ApplicationDbContext db;
        protected Document doc;
        protected MemoryStream ms;
        protected PdfWriter writer;
        protected BaseFont baseFont;
        protected Font defaultFont;
        protected Font lightFont;
        protected Font mediumFont;
        protected Font boldFont;
        protected Font h1Font;
        protected Font h2Font;
        protected Font h3Font;
        protected Font h4Font;
        private Font reportTitleFont;
        private Font coverTableFont;
        private bool hasCoverPage = false;
        private TwoColumnHeaderFooter pageEvent;
        protected string imagesFolder;
        protected const string PDFContentType = "application/pdf";
        protected AppSettings appSettings;

        protected PDFReports(ApplicationDbContext dbContext, AppSettings appSettings)
        {
            db = dbContext;
            this.appSettings = appSettings;
            imagesFolder = appSettings.WebRootPath + "wwwroot/images/";
            //var baseFontPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "fonts", "GOTHIC.TTF");
            //_bf = BaseFont.CreateFont(baseFontPath, BaseFont.CP1252, BaseFont.EMBEDDED);
            baseFont = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, false);
            defaultFont = new Font(baseFont, 9, Font.NORMAL, iTextColors.BLACK);
            lightFont = new Font(baseFont, 9, Font.NORMAL, iTextColors.DARK_GRAY);
            mediumFont = new Font(baseFont, 9, Font.NORMAL, new BaseColor(System.Drawing.Color.FromArgb(60, 60, 60)));
            boldFont = new Font(baseFont, 9, Font.BOLD, iTextColors.BLACK);
            h1Font = new Font(baseFont, 16, Font.NORMAL, iTextColors.BLACK);
            h2Font = new Font(baseFont, 14, Font.NORMAL, iTextColors.BLACK);
            h3Font = new Font(baseFont, 12, Font.NORMAL, iTextColors.BLACK);
            h4Font = new Font(baseFont, 10, Font.NORMAL, iTextColors.BLACK);
            reportTitleFont = new Font(baseFont, 24, Font.NORMAL, iTextColors.BLACK);
            coverTableFont = new Font(baseFont, 10, Font.NORMAL, iTextColors.GRAY);
        }

        protected Document CreateDoc(Rectangle pageSize = null, float marginLeft = 36, float marginRight = 36, float marginTop = 36, float marginBottom = 45, bool hasCoverPage = false)
        {
            // 1mm = 2.833 pixels; A4 = 210x297 == 595x842
            if (pageSize == null) pageSize = PageSize.A4;
            this.hasCoverPage = hasCoverPage;
            doc = new Document(pageSize, marginLeft, marginRight, marginTop, marginBottom);
            writer = PdfWriter.GetInstance(doc, ms);
            writer.CloseStream = false;
            writer.RgbTransparencyBlending = true;
            pageEvent = new TwoColumnHeaderFooter(baseFont, doc.LeftMargin, doc.RightMargin, doc.TopMargin, doc.BottomMargin, hasCoverPage);
            writer.PageEvent = pageEvent;
            writer.ViewerPreferences = PdfWriter.PageModeUseOutlines;
            // ensure images don't jump down after content near end of pages
            writer.StrictImageSequence = true;

            doc.Open();
            return doc;
        }

        protected void AddCoverPage(string title, PdfPTable coverTable = null, string coverTableTitle = null)
        {
            doc.Add(new Paragraph(Environment.NewLine));

            // logo
            var logo = Image.GetInstance(Path.Combine(imagesFolder, "reportlogo.png"));
            logo.ScalePercent(50f);
            logo.Alignment = Element.ALIGN_LEFT;
            var p = new Paragraph { SpacingBefore = 50f, SpacingAfter = 25f };
            p.Add(logo);
            doc.Add(p);

            // title
            doc.Add(new Paragraph(title, reportTitleFont) { SpacingAfter = 25f });

            // cover table
            if (coverTableTitle != null) doc.Add(new Paragraph(coverTableTitle, coverTableFont));
            if (coverTable != null) doc.Add(coverTable);

        }

        protected PdfPTable CreateTable(float[] widths, int borderWidth = 0, int paddingBottom = 0, float spacingBefore = 25f, float spacingAfter = 10f, int horizontalAlignment = Rectangle.ALIGN_LEFT, float widthPercentage = 100)
        {
            var table = new PdfPTable(widths);

            table.DefaultCell.BorderWidth = borderWidth;
            table.DefaultCell.PaddingBottom = paddingBottom;
            table.SpacingBefore = spacingBefore;
            table.SpacingAfter = spacingAfter;
            table.HorizontalAlignment = horizontalAlignment;
            table.WidthPercentage = widthPercentage;

            return table;
        }

        protected PdfPCell CreateCell(object contents)
        {
            var cellFont = defaultFont;

            PdfPCell cell;
            if (contents == null)
            {
                cell = new PdfPCell();
            }
            else if (contents.GetType() == typeof(System.String))
            {
                // if the cell fond is not the default font, change it here...
                cell = new PdfPCell(new Phrase((Convert.ToString(contents)) == string.Empty ? Environment.NewLine : Convert.ToString(contents), cellFont));
            }
            else if (contents.GetType() == typeof(Paragraph))
            {
                cell = new PdfPCell((Paragraph)contents);
            }
            else if (contents.GetType() == typeof(ImgRaw))
            {
                cell = new PdfPCell((Image)contents);
            }
            else if (contents.GetType() == typeof(Jpeg))
            {
                cell = new PdfPCell((Jpeg)contents);
            }
            else if (contents.GetType() == typeof(PdfPTable))
            {
                cell = new PdfPCell((PdfPTable)contents);
            }
            else
            {
                throw new Exception("Invalid CellContents type in GetCell: " + contents.GetType().FullName);
            }

            cell.PaddingTop = 4f; //default: 2
            cell.PaddingRight = 4f; //default: 2
            cell.PaddingBottom = 6f; //default: 2
            cell.PaddingLeft = 4f; //default: 2

            return cell;
        }

        protected void InsertImage(MemoryStream imageStream, float scalePercent = 30f)
        {
            imageStream.Position = 0;
            var chartImage = Image.GetInstance(imageStream.ToArray());
            chartImage.Alignment = Element.ALIGN_CENTER;
            chartImage.ScalePercent(scalePercent);
            doc.Add(chartImage);
        }

        protected byte[] Close()
        {
            try
            {
                doc.Close();
            }
            catch (IOException exception)
            {
                if (exception.Message == "The document has no pages.")
                    //throw new ReportException(GetReportName(), "The report is empty");
                    throw new Exception("The report is empty");
                throw;
            }

            writer.Close();
            return ms.ToArray();
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

        private class TwoColumnHeaderFooter : PdfPageEventHelper
        {
            //private List<TableOfContentsItem> TableOfContents = new List<TableOfContentsItem>();
            //public override void OnGenericTag(PdfWriter writer, Document document, Rectangle rect, string text)
            //{
            //  todo: how to set the level ?
            //  TableOfContents.Add(new TableOfContentsItem { Name = text, PageNumber = writer.PageNumber });
            //}
            //public List<TableOfContentsItem> GetTableOfContents()
            //{
            //  return TableOfContents;
            //}

            #region Properties
            private PdfTemplate _template;
            private BaseFont _bf;
            private string _topLeftText { get; set; }
            private string _topRightText { get; set; }
            private string _bottomRightText { get; set; }
            private readonly int fontSize = 8;
            private readonly int headerAndFooterInset = 30;
            private readonly float _leftMargin;
            private readonly float _rightMargin;
            private readonly float _topMargin;
            private readonly float _bottomMargin;
            private readonly bool _hasCoverPage;
            private int _tableOfContentsPages { get; set; }
            #endregion

            public void SetTopLeftText(string text) { _topLeftText = text; }
            public void SetTopRightText(string text) { _topRightText = text; }
            public void SetBottomRightText(string text) { _bottomRightText = text; }
            public void SetTableOfContentsPages(int numberOfPages) { _tableOfContentsPages = numberOfPages; }

            public TwoColumnHeaderFooter(BaseFont bf, float leftMargin, float rightMargin, float topMargin, float bottomMargin, bool hasCoverPage = false)
            {
                _bf = bf;
                _leftMargin = leftMargin;
                _rightMargin = rightMargin;
                _topMargin = topMargin;
                _bottomMargin = bottomMargin;
                _hasCoverPage = hasCoverPage;
            }

            public override void OnEndPage(PdfWriter writer, Document document)
            {
                base.OnEndPage(writer, document);

                if (writer.PageNumber == 1 && _hasCoverPage) return;

                var pageSize = document.PageSize;
                var headerPosition = pageSize.GetTop(0) - headerAndFooterInset;
                var footerPosition = headerAndFooterInset;

                var pageN = writer.PageNumber + _tableOfContentsPages - (_hasCoverPage ? 1 : 0);
                var cb = writer.DirectContent;
                cb.SetFontAndSize(_bf, fontSize);
                cb.SetRgbColorFill(180, 180, 180);

                // if no table of contents, 
                var text = "Page " + pageN + " of ";
                var len = _bf.GetWidthPoint(text, fontSize);

                cb.BeginText();
                cb.SetTextMatrix(pageSize.GetLeft(_leftMargin), footerPosition);
                cb.ShowText(text);
                cb.EndText();

                if (_template == null) _template = cb.CreateTemplate(50, 50);
                cb.AddTemplate(_template, pageSize.GetLeft(_leftMargin) + len, footerPosition);

                if (!string.IsNullOrEmpty(_topLeftText))
                {
                    cb.BeginText();
                    cb.SetTextMatrix(pageSize.GetLeft(_leftMargin), headerPosition);
                    cb.ShowText(_topLeftText);
                    cb.EndText();
                }

                if (!string.IsNullOrEmpty(_topRightText))
                {
                    cb.BeginText();
                    var textSize = _bf.GetWidthPoint(_topRightText, fontSize);
                    cb.SetTextMatrix(pageSize.GetRight(_rightMargin) - textSize, headerPosition);
                    cb.ShowText(_topRightText);
                    cb.EndText();
                }

                if (!string.IsNullOrEmpty(_bottomRightText))
                {
                    cb.BeginText();
                    var textSize = _bf.GetWidthPoint(_bottomRightText, fontSize);
                    cb.SetTextMatrix(pageSize.GetRight(_rightMargin) - textSize, footerPosition);
                    cb.ShowText(_bottomRightText);
                    cb.EndText();
                }
            }

            public override void OnCloseDocument(PdfWriter writer, Document document)
            {
                base.OnCloseDocument(writer, document);

                if (_template != null)
                {
                    _template.BeginText();
                    _template.SetFontAndSize(_bf, fontSize);
                    _template.SetTextMatrix(0, 0);
                    // if removing table of contents
                    _template.ShowText((writer.PageNumber - 1 - (_hasCoverPage ? 1 : 0)).ToString());
                    _template.EndText();
                }
            }

        }

    }

    public enum CellStyle
    {
        None, Label, Text, NoBorder,
        RightAligned, CenterAligned,
        Green, Yellow, Orange, Red, LightGray
    }

    public enum CellStyles
    {
        ColumnHeader, NumericValue
    }

    public static class iTextColors
    {
        public static BaseColor WHITE = new BaseColor(System.Drawing.Color.White);
        public static BaseColor BLACK = new BaseColor(System.Drawing.Color.Black);
        public static BaseColor LIGHT_GRAY = new BaseColor(System.Drawing.Color.LightGray);
        public static BaseColor DARK_GRAY = new BaseColor(90, 90, 90);
        public static BaseColor GRAY = new BaseColor(System.Drawing.Color.Gray);
        public static BaseColor YELLOW = new BaseColor(System.Drawing.Color.Yellow);
        public static BaseColor BLUE = new BaseColor(System.Drawing.Color.Blue);

        public static BaseColor iTextColor(System.Drawing.Color color)
        {
            return new BaseColor(color);
        }
    }

    public static class iTextExtensions
    {
        public static PdfPCell SetStyle(this PdfPCell cell, CellStyle cellStyle)
        {
            if (cellStyle == CellStyle.None)
            {
                // nothing
            }
            else if (cellStyle == CellStyle.Label)
            {
                cell.BackgroundColor = iTextColors.LIGHT_GRAY;
            }
            else if (cellStyle == CellStyle.NoBorder)
            {
                cell.BorderColor = iTextColors.WHITE;
                cell.BorderWidth = 0;
                cell.Border = Rectangle.NO_BORDER;
            }
            else if (cellStyle == CellStyle.RightAligned)
            {
                cell.HorizontalAlignment = Rectangle.ALIGN_RIGHT;
            }
            else if (cellStyle == CellStyle.CenterAligned)
            {
                cell.HorizontalAlignment = Rectangle.ALIGN_CENTER;
            }
            else if (cellStyle == CellStyle.Text)
            {
                // nothing?
            }
            else if (cellStyle == CellStyle.Green)
            {
                cell.BackgroundColor = BaseColor.Green;
            }
            else if (cellStyle == CellStyle.Yellow)
            {
                cell.BackgroundColor = BaseColor.Yellow;
            }
            else if (cellStyle == CellStyle.Orange)
            {
                cell.BackgroundColor = BaseColor.Orange;
            }
            else if (cellStyle == CellStyle.Red)
            {
                cell.BackgroundColor = BaseColor.Red;
            }
            else if (cellStyle == CellStyle.LightGray)
            {
                cell.BackgroundColor = BaseColor.LightGray;
            }

            return cell;
        }

        public static PdfPCell SetStyle(this PdfPCell cell, params CellStyle[] cellStyles)
        {
            foreach (var cellStyle in cellStyles)
                cell = cell.SetStyle(cellStyle);

            return cell;
        }

        public static PdfPCell SetStyle(this PdfPCell cell, CellStyles cellStyles)
        {
            if (cellStyles == CellStyles.ColumnHeader)
            {
                cell = cell.SetStyle(new CellStyle[] { CellStyle.Label, CellStyle.CenterAligned });
            }
            else if (cellStyles == CellStyles.NumericValue)
            {
                cell = cell.SetStyle(new CellStyle[] { CellStyle.None, CellStyle.RightAligned });
            }

            return cell;
        }
    }
}
