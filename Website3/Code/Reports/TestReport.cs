using System.IO;
using System.Threading.Tasks;
using WEB.Models;

namespace WEB.Reports.PDF
{
    public class TestReport : PDFReports
    {
        public TestReport(ApplicationDbContext db, Settings settings)
            : base(db, settings)
        {
        }

        public override Task<byte[]> GenerateAsync()
        {
            #region load data
            
            #endregion

            byte[] bytes;
            using (ms = new MemoryStream())
            {
                CreateDoc(hasCoverPage: true);

                #region cover page
                var coverTable = CreateTable(new float[] { 25f, 75f }, spacingBefore: 0);

                coverTable.AddCell(CreateCell("Something here").SetStyle(CellStyle.Label));
                coverTable.AddCell(CreateCell("value").SetStyle(CellStyle.Text));

                AddCoverPage("Report Name", coverTable);
                #endregion;

                bytes = Close();
            }

            return Task.FromResult(bytes);
        }

        public override string GetReportName()
        {
            return "Test Report.pdf";
        }

        public override string GetContentType()
        {
            return PDFContentType;
        }
    }
}