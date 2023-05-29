using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Drawing.Chart;
using OfficeOpenXml.Style;
using System.Drawing;
using WEB.Error;
using WEB.Models;

namespace WEB.Reports.Excel
{
    public class QuestionnaireExport : ExcelReports
    {
        private Questionnaire questionnaire;
        private Guid[] entityIds;
        private Guid[] dateIds;
        private Guid[] fieldIds;
        private bool useOptionValues;
        private bool useOptionColors;
        private bool includeSummaries;
        private bool includeCharts;

        public QuestionnaireExport(ApplicationDbContext db, AppSettings appSettings, Questionnaire questionnaire, Guid[] entityIds, Guid[] dateIds, Guid[] fieldIds, bool includeSummaries, bool useOptionValues, bool useOptionColors, bool includeCharts)
            : base(db, appSettings)
        {
            this.questionnaire = questionnaire;
            this.entityIds = entityIds;
            this.dateIds = dateIds;
            this.fieldIds = fieldIds;
            this.includeSummaries = includeSummaries;
            this.useOptionValues = useOptionValues;
            this.useOptionColors = useOptionColors;
            this.includeCharts = includeCharts;
        }

        public override async Task<byte[]> GenerateAsync()
        {
            #region load data
            var sections = await db.Sections.Where(o => o.QuestionnaireId == questionnaire.QuestionnaireId)
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            if (!sections.Any()) throw new HandledException("The questionnaire does not have any sections defined");

            var dates = await db.Dates.Where(o => o.DateType == questionnaire.DateType && (!dateIds.Any() || dateIds.Contains(o.DateId)))
                .ToListAsync();

            var questions = await db.Questions
                .Include(o => o.SkipLogicOptions)
                .Where(o => o.Section.QuestionnaireId == questionnaire.QuestionnaireId)
                // avoid cartesion explosion from includeing skiplogicoptions
                .AsSplitQuery()
                .ToListAsync();

            if (!questions.Any()) throw new HandledException("The questionnaire does not have any questions defined");

            var questionsBySectionId = questions
                .GroupBy(o => o.SectionId)
                .ToDictionary(o => o.Key, o => o.OrderBy(o => o.SortOrder).ToList());

            foreach (var section in sections)
                if (!questionsBySectionId.ContainsKey(section.SectionId))
                    questionsBySectionId.Add(section.SectionId, new List<Question>());

            var optionGroups = await db.QuestionOptionGroups
                .Include(o => o.QuestionOptions.OrderBy(opt => opt.SortOrder))
                .Where(o => o.Questions.Any(q => q.Section.QuestionnaireId == questionnaire.QuestionnaireId))
                .ToDictionaryAsync(o => o.QuestionOptionGroupId);

            var responses = await db.Responses
                .Include(o => o.Entity)
                .Include(o => o.Date)
                .Include(o => o.SubmittedBy)
                .Where(o => o.QuestionnaireId == questionnaire.QuestionnaireId)
                .Where(o => !entityIds.Any() || entityIds.Contains(o.EntityId))
                .Where(o => !dateIds.Any() || dateIds.Contains(o.DateId))
                .OrderBy(o => o.CreatedOnUtc)
                .ToListAsync();

            var responseIds = responses.Select(o => o.ResponseId).ToArray();
            // if loading all entities, specify the ids exactly here (for use with fields)
            if (!entityIds.Any()) entityIds = responses.Select(o => o.EntityId).ToArray();

            var answers = await db.Answers
                .Include(o => o.AnswerOptions)
                .Where(o => o.Question.Section.QuestionnaireId == questionnaire.QuestionnaireId)
                .Where(o => responseIds.Contains(o.ResponseId))
                .ToListAsync();

            var answerLookup = new Dictionary<Guid, Dictionary<Guid, Answer>>();
            foreach (var response in responses)
                answerLookup.Add(response.ResponseId, new Dictionary<Guid, Answer>());

            foreach (var answer in answers)
                answerLookup[answer.ResponseId].Add(answer.QuestionId, answer);

            var answerIds = answers.Select(o => o.AnswerId).ToList();
            // this could be converted into a dictionary<AnswerId, joinedString>
            var documents = await db.Documents
                .Where(o => answerIds.Contains(o.ItemId))
                .Select(o => new { AnswerId = o.ItemId, o.FileName })
                .ToListAsync();

            // todo: make this a dictionary (dateId) of dictionaries (questionId)
            var questionSummaries = includeSummaries
                ? await db.QuestionSummaries
                    .Where(o => (!dateIds.Any() || dateIds.Contains(o.DateId)) && o.Question.Section.QuestionnaireId == questionnaire.QuestionnaireId)
                    .ToListAsync()
                : new List<QuestionSummary>();

            var useAverageRow = questions.Any(o => o.QuestionType == QuestionType.OptionList && o.OptionListType != OptionListType.Checkboxes && optionGroups[o.QuestionOptionGroupId.Value].QuestionOptions.Any() && optionGroups[o.QuestionOptionGroupId.Value].QuestionOptions.All(qo => qo.Value.HasValue));

            var fields = await db.Fields
                .Include(o => o.Options)
                .Where(o => fieldIds.Contains(o.FieldId) && o.Entity).ToListAsync();

            var fieldValues = await db.FieldValues
                .Where(o => entityIds.Contains(o.ItemId))
                .ToListAsync();

            // Dictionary<fieldId, Dictionary<entityId, fieldValue>>
            var fieldValueLookup = fieldValues
                .GroupBy(o => o.FieldId)
                .ToDictionary(o => o.Key, o => o.ToDictionary(x => x.ItemId));

            var optionValues = await db.OptionValues
                .Include(o => o.Option)
                .Where(o => entityIds.Contains(o.ItemId))
                .ToListAsync();

            // Dictionary<fieldId, Dictionary<entityId, List<optionValue>>>
            var optionValueLookup = optionValues
                .GroupBy(o => o.Option.FieldId)
                .ToDictionary(o => o.Key, o => o.GroupBy(x => x.ItemId).ToDictionary(x => x.Key, y => y.ToList()));
            #endregion

            byte[] bytes;
            using var xls = new ExcelPackage();

            var questionColumns = new Dictionary<Guid, int>();
            var optionColumns = new Dictionary<Guid, int>();

            foreach (var date in dates)
            {
                var responsesInDate = responses.Where(o => o.DateId == date.DateId);

                var ws = xls.Workbook.Worksheets.Add(date.Code);

                var col = 1;
                ws.Cells[4, col++].Value = questionnaire.EntityType.Name;
                foreach (var field in fields)
                {
                    // todo: will need a col for each option...
                    if (field.FieldType == FieldType.Picklist && field.Multiple) throw new HandledException("Multiple choice fields have not been implemented in the export");
                    ws.Cells[4, col++].Value = field.Name;
                }
                ws.Cells[4, col++].Value = "Created";
                ws.Cells[4, 1, 4, col - 1].SetStyle(ExcelExtensions.CellStyle.Header);

                var firstQuestionCol = col;

                ws.Cells[1, firstQuestionCol - 1].SetValue("Section:");
                ws.Cells[2, firstQuestionCol - 1].SetValue("Code:");
                ws.Cells[3, firstQuestionCol - 1].SetValue("Question:");
                ws.Cells[1, firstQuestionCol - 1, 3, firstQuestionCol - 1]
                    .SetHorizontalAlignment(ExcelHorizontalAlignment.Right);

                col = firstQuestionCol;
                foreach (var section in sections)
                {
                    foreach (var question in questionsBySectionId[section.SectionId])
                    {
                        questionColumns.Add(question.QuestionId, col);

                        if (question.QuestionType == QuestionType.OptionList && question.OptionListType == OptionListType.Checkboxes)
                        {
                            if (!question.QuestionOptionGroupId.HasValue) throw new Exception($"Question {question.Code} does not have an Option Group selected");

                            var optionGroup = optionGroups[question.QuestionOptionGroupId.Value];

                            foreach (var option in optionGroup.QuestionOptions)
                            {
                                optionColumns.Add(option.QuestionOptionId, col);

                                ws.Cells[1, col].Value = section.Name;
                                ws.Cells[2, col].Value = question.Code;
                                ws.Cells[3, col].Value = question.Text;
                                ws.Cells[4, col++].Value = option.Label;
                            }
                        }
                        else
                        {
                            ws.Cells[1, col].Value = section.Name;
                            ws.Cells[2, col].Value = question.Code;
                            ws.Cells[3, col].Value = question.Text;
                            col++;
                        }
                    }
                }
                var lastQuestionCol = col - 1;

                if (questionnaire.UseSubmit)
                {
                    ws.Cells[4, col++].Value = "Submitted By";
                    ws.Cells[4, col++].Value = "Submitted On";
                }
                ws.Cells[4, col++].Value = "Total Questions";
                ws.Cells[4, col++].Value = "Applicable Questions";
                ws.Cells[4, col++].Value = "Completed Questions";
                ws.Cells[4, col++].Value = "Completion Percent";

                var lastCol = col - 1;

                var row = 5;
                foreach (var response in responsesInDate)
                {
                    col = 1;
                    ws.Cells[row, col++].Value = response.Entity.Name;
                    foreach (var field in fields)
                    {
                        if (field.FieldType == FieldType.Text)
                            ws.Cells[row, col++].Value = fieldValueLookup.GetValueOrDefault(field.FieldId)?.GetValueOrDefault(response.EntityId)?.Value ?? null;
                        else if (field.FieldType == FieldType.Picklist)
                        {
                            // todo: will need a col for each option...
                            if (field.Multiple) throw new Exception("Not implemented");
                            var optionValue = optionValueLookup.GetValueOrDefault(field.FieldId)?.GetValueOrDefault(response.EntityId)?.Single();
                            ws.Cells[row, col++].Value = optionValue == null ? null : field.Options.Single(o => o.OptionId == optionValue.OptionId).Name;
                        }
                        else
                            throw new NotImplementedException();
                    }
                    ws.Cells[row, col++].Value = response.CreatedOnUtc; //LongDateFormat

                    var responseAnswers = answerLookup[response.ResponseId];

                    foreach (var section in sections)
                    {
                        foreach (var question in questionsBySectionId[section.SectionId])
                        {
                            var answer = responseAnswers.GetValueOrDefault(question.QuestionId);
                            var colCount = 1;

                            if (question.QuestionType == QuestionType.Note)
                            {
                                // nothing to output
                                col++;
                            }
                            else if (question.QuestionType == QuestionType.Text || question.QuestionType == QuestionType.Multiline)
                            {
                                var answerText = answer?.Value ?? string.Empty;
                                ws.Cells[row, col++].Value = answerText;
                            }
                            else if (question.QuestionType == QuestionType.OptionList)
                            {
                                if (!question.QuestionOptionGroupId.HasValue) throw new Exception($"Question {question.Code} does not have an Option Group selected");

                                var optionGroup = optionGroups[question.QuestionOptionGroupId.Value];

                                if (question.OptionListType == OptionListType.Checkboxes)
                                {
                                    colCount = optionGroup.QuestionOptions.Count();

                                    foreach (var option in optionGroup.QuestionOptions)
                                    {
                                        ws.Cells[row, col++].Value = question.ShouldShow(responseAnswers) ? ((answer?.AnswerOptions?.Any(o => o.QuestionOptionId == option.QuestionOptionId) ?? false) ? "Yes" : "No") : null;
                                    }
                                }
                                else
                                {
                                    if (answer != null)
                                    {
                                        var firstSelectedOption = optionGroup.QuestionOptions.FirstOrDefault(qo => answer.AnswerOptions.Any(ao => ao.QuestionOptionId == qo.QuestionOptionId));
                                        if (firstSelectedOption != null)
                                        {
                                            if (useOptionValues && firstSelectedOption.Value.HasValue) ws.Cells[row, col].Value = firstSelectedOption.Value;
                                            else ws.Cells[row, col].Value = firstSelectedOption.Label;

                                            if (useOptionColors && !string.IsNullOrWhiteSpace(firstSelectedOption.Color))
                                                ws.Cells[row, col].SetBackgroundColor(ColorTranslator.FromHtml($"{firstSelectedOption.Color}"));
                                        }
                                    }
                                    col++;
                                }
                            }
                            else if (question.QuestionType == QuestionType.Document)
                            {
                                if (answer != null)
                                {
                                    var files = string.Join(", ", documents.Where(o => o.AnswerId == answer.AnswerId).Select(o => o.FileName));
                                    ws.Cells[row, col].Value = files;
                                }
                                col++;
                            }
                            else
                                throw new NotImplementedException($"Invalid QuestionType: {question.QuestionType}");

                            if (!question.ShouldShow(responseAnswers))
                                ws.Cells[row, col - colCount, row, col - 1].SetBackgroundColor(Color.LightGray);
                        }
                    }

                    if (questionnaire.UseSubmit)
                    {
                        ws.Cells[row, col++].Value = response.SubmittedBy?.FullName;
                        ws.Cells[row, col++].Value = response.SubmittedOnUtc;
                    }

                    ws.Cells[row, col++].Value = response.TotalQuestions;
                    ws.Cells[row, col++].Value = response.ApplicableQuestions;
                    ws.Cells[row, col++].Value = response.CompletedQuestions;
                    ws.Cells[row, col++].SetFormula($"=IF({GetExcelColumnName(lastCol - 2)}{row}=0,0,{GetExcelColumnName(lastCol - 1)}{row}/{GetExcelColumnName(lastCol - 2)}{row})");
                    //response.ApplicableQuestions == 0 ? 0 : response.CompletedQuestions / response.ApplicableQuestions;

                    row++;
                }

                ws.Cells[1, firstQuestionCol - 1, 4, lastQuestionCol].SetStyle(ExcelExtensions.CellStyle.Header);
                if (questionnaire.UseSubmit) ws.Cells[4, lastQuestionCol + 1, 4, lastQuestionCol + 2].SetStyle(ExcelExtensions.CellStyle.Header);

                // format created
                if (responsesInDate.Any()) ws.Cells[5, firstQuestionCol - 1, 4 + responses.Count, firstQuestionCol - 1].SetNumberFormat(LongDateFormat);

                if (questionnaire.UseSubmit)
                {
                    if (responsesInDate.Any()) ws.Cells[5, lastQuestionCol + 2, 4 + responses.Count, lastQuestionCol + 2].SetNumberFormat(LongDateFormat);
                }

                // submitted/completed header formatting
                ws.Cells[4, lastQuestionCol + 1, 4, lastCol].SetStyle(ExcelExtensions.CellStyle.Header);

                if (responsesInDate.Any())
                {
                    if (useAverageRow)
                    {
                        col = firstQuestionCol - 1;
                        ws.Cells[row, col++]
                            .SetValue("Average:")
                            .SetHorizontalAlignment(ExcelHorizontalAlignment.Right);

                        foreach (var section in sections)
                        {
                            foreach (var question in questionsBySectionId[section.SectionId])
                            {
                                if (question.QuestionType == QuestionType.OptionList)
                                {
                                    var optionGroup = optionGroups[question.QuestionOptionGroupId.Value];

                                    if (question.OptionListType != OptionListType.Checkboxes)
                                    {
                                        // only average if all options have values
                                        if (optionGroup.QuestionOptions.All(o => o.Value.HasValue))
                                        {
                                            if (useOptionValues)
                                                // values will be in cells: can just average them
                                                ws.Cells[row, col].SetFormula($"=AVERAGE({GetExcelColumnName(col)}5:{GetExcelColumnName(col)}{row - 1})");
                                            else
                                            {
                                                var average = answerLookup.Values
                                                    .Where(o => o.ContainsKey(question.QuestionId) && o[question.QuestionId].AnswerOptions.Any())
                                                    .Select(o => optionGroup.QuestionOptions.First(qo => qo.QuestionOptionId == o[question.QuestionId].AnswerOptions.First().QuestionOptionId).Value)
                                                    .Average();

                                                ws.Cells[row, col].SetValue(average);
                                            }

                                        }
                                        // todo: how many decimal places?
                                        ws.Cells[row, col].SetNumberFormat("#0.0");
                                        col++;
                                    }
                                    else
                                    {
                                        foreach (var option in optionGroup.QuestionOptions)
                                            col++;
                                    }
                                }
                                else
                                {
                                    col++;
                                }
                            }
                        }

                        // footer row formatting
                        ws.Cells[row, 2, row, lastCol].SetStyle(ExcelExtensions.CellStyle.Header);

                        // percentage completed formatting
                        ws.Cells[5, lastCol, row, lastCol].SetNumberFormat("0%");

                        // calculations for completion percent in footer row
                        ws.Cells[row, lastCol - 2].SetFormula($"=SUM({GetExcelColumnName(lastCol - 2)}5:{GetExcelColumnName(lastCol - 2)}{row - 1})");
                        ws.Cells[row, lastCol - 1].SetFormula($"=SUM({GetExcelColumnName(lastCol - 1)}5:{GetExcelColumnName(lastCol - 1)}{row - 1})");
                        ws.Cells[row, lastCol].SetFormula($"=IF({GetExcelColumnName(lastCol - 2)}{row}=0,0,{GetExcelColumnName(lastCol - 1)}{row}/{GetExcelColumnName(lastCol - 2)}{row})");

                        row++;
                    }

                    if (includeSummaries)
                    {
                        col = firstQuestionCol - 1;
                        ws.Cells[row, col++]
                            .SetValue("Summary:")
                            .SetHorizontalAlignment(OfficeOpenXml.Style.ExcelHorizontalAlignment.Right);

                        foreach (var section in sections)
                        {
                            foreach (var question in questionsBySectionId[section.SectionId])
                            {
                                var qs = questionSummaries.SingleOrDefault(o => o.DateId == date.DateId && o.QuestionId == question.QuestionId);
                                ws.Cells[row, col++].SetValue(qs?.Summary ?? string.Empty);
                            }
                        }

                        // footer row formatting
                        ws.Cells[row, 2, row, lastCol].SetStyle(ExcelExtensions.CellStyle.Header);

                        row++;
                    }
                }

                ws.Column(1).AutoFit();
                ws.Column(2).AutoFit();

            }

            if (includeCharts)
            {
                // should only be one date
                var date = dates.Single();

                foreach (var section in sections)
                {
                    foreach (var question in questionsBySectionId[section.SectionId])
                    {
                        if (question.QuestionType != QuestionType.OptionList) continue;

                        var ws = xls.Workbook.Worksheets.Add(question.Code);

                        ws.Cells[1, 1].SetValue($"Question {question.Code}");
                        ws.Cells[1, 2].SetValue($"Count");
                        if (question.OptionListType == OptionListType.Checkboxes)
                            ws.Cells[1, 3].SetValue($"Percent");

                        var optionGroup = optionGroups[question.QuestionOptionGroupId.Value];

                        var row = 1;
                        foreach (var option in optionGroup.QuestionOptions)
                        {
                            row++;
                            ws.Cells[row, 1].SetValue(option.Label);
                            if (question.OptionListType == OptionListType.Checkboxes)
                            {
                                ws.Cells[row, 2].SetFormula($"=COUNTIF('{date.Code}'!{GetExcelColumnName(optionColumns[option.QuestionOptionId])}:{GetExcelColumnName(optionColumns[option.QuestionOptionId])},\"Yes\")");
                            }
                            else
                            {
                                ws.Cells[row, 2].SetFormula($"=COUNTIF('{date.Code}'!{GetExcelColumnName(questionColumns[question.QuestionId])}:{GetExcelColumnName(questionColumns[question.QuestionId])},{question.Code}!A{row})");
                                ws.Cells[row, 3].SetFormula($"=B{row}/B{optionGroup.QuestionOptions.Count() + 2}");
                                ws.Cells[row, 3].SetNumberFormat("0.0%");
                            }
                        }
                        ws.Cells[row + 1, 1].SetValue("Total");
                        ws.Cells[row + 1, 2].SetFormula($"=SUM(B2:B{row})");

                        var barChart = ws.Drawings.AddChart("barChart", eChartType.ColumnClustered);
                        barChart.RoundedCorners = false;
                        barChart.Border.Fill.Color = Color.White;
                        barChart.SetSize(600, 400);
                        barChart.SetPosition(10, 200);
                        barChart.Legend.Remove();
                        barChart.Title.Text = $"Number of Responses";
                        barChart.Title.Font.SetFromFont(new Font("Quite Sans", 12));
                        barChart.Title.Font.ComplexFont = "Quire Sans";
                        barChart.Title.Font.LatinFont = "Quire Sans";
                        barChart.XAxis.Font.SetFromFont(new Font("Quite Sans", 12));
                        barChart.XAxis.Font.ComplexFont = "Quire Sans";
                        barChart.XAxis.Font.LatinFont = "Quire Sans";
                        barChart.XAxis.MinorTickMark = eAxisTickMark.None;
                        barChart.XAxis.MajorTickMark = eAxisTickMark.None;
                        barChart.YAxis.Font.SetFromFont(new Font("Quite Sans", 12));
                        barChart.YAxis.Font.ComplexFont = "Quire Sans";
                        barChart.YAxis.Font.LatinFont = "Quire Sans";
                        barChart.YAxis.MinorTickMark = eAxisTickMark.None;
                        barChart.YAxis.MajorGridlines.LineStyle = OfficeOpenXml.Drawing.eLineStyle.Solid;
                        barChart.YAxis.MajorGridlines.Fill.Color = Color.FromArgb(217, 217, 217);
                        barChart.YAxis.Border.Fill.Color = Color.White;
                        barChart.XAxis.Border.Fill.Color = Color.FromArgb(217, 217, 217);
                        barChart.Series.Add(ExcelCellBase.GetAddress(2, 2, row, 2), ExcelCellBase.GetAddress(2, 1, row, 1));

                        if (question.OptionListType != OptionListType.Checkboxes)
                        {
                            var pieChart = ws.Drawings.AddChart("pieChart", eChartType.Pie);
                            pieChart.RoundedCorners = false;
                            pieChart.Border.Fill.Color = Color.White;
                            pieChart.SetSize(500, 400);
                            pieChart.SetPosition(10, 850);
                            pieChart.Title.Text = $"% of Total Responses";
                            pieChart.Title.Font.SetFromFont(new Font("Quite Sans", 12));
                            pieChart.Title.Font.ComplexFont = "Quire Sans";
                            pieChart.Title.Font.LatinFont = "Quire Sans";
                            pieChart.Legend.Position = eLegendPosition.Bottom;
                            pieChart.Legend.Font.SetFromFont(new Font("Quite Sans", 12));
                            pieChart.Legend.Font.ComplexFont = "Quire Sans";
                            pieChart.Legend.Font.LatinFont = "Quire Sans";
                            pieChart.Series.Add(ExcelCellBase.GetAddress(2, 3, row, 3), ExcelCellBase.GetAddress(2, 1, row, 1));
                            pieChart.Series[0].Border.LineStyle = OfficeOpenXml.Drawing.eLineStyle.Solid;
                            pieChart.Series[0].Border.Fill.Color = Color.White;
                            var series = (ExcelPieChartSerie)pieChart.Series[0];
                            series.DataLabel.ShowPercent = true;
                            series.DataLabel.Position = eLabelPosition.Center;
                            series.DataLabel.Font.SetFromFont(new Font("Quite Sans", 12));
                            series.DataLabel.Font.ComplexFont = "Quire Sans";
                            series.DataLabel.Font.LatinFont = "Quire Sans";
                            pieChart.Series[0].Border.Width = 2;
                        }

                        ws.Column(1).AutoFit();
                        ws.Column(2).AutoFit();
                    }
                }
            }

            bytes = xls.GetAsByteArray();

            return bytes;
        }

        public override string GetReportName()
        {
            return $"{questionnaire.Name}.xlsx";
        }

        public override string GetContentType()
        {
            return ExcelContentType;
        }
    }
}