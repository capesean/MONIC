using iTextSharp.text;
using Microsoft.EntityFrameworkCore;
using WEB.Error;
using WEB.Models;

namespace WEB.Reports.PDF
{
    public class QuestionnairePDF : PDFReports
    {
        private Questionnaire questionnaire;
        private Response response;
        private Guid? dateId;
        private bool includeSkipLogic;
        private bool includeSummaries;

        public QuestionnairePDF(ApplicationDbContext db, AppSettings appSettings, Questionnaire questionnaire, Response response, Guid? dateId, bool includeSkipLogic, bool includeSummaries)
            : base(db, appSettings)
        {
            this.questionnaire = questionnaire;
            this.response = response;
            this.dateId = dateId;
            this.includeSkipLogic = includeSkipLogic;
            this.includeSummaries = includeSummaries;
        }

        public override async Task<byte[]> GenerateAsync()
        {
            #region load data
            if (dateId.HasValue && response != null) throw new InvalidOperationException("Can't provide a date Id and a response");
            if (!dateId.HasValue && includeSummaries) throw new InvalidOperationException("Including summaries required the date Id");

            var entity = response == null ? null : await db.Entities.Include(o => o.EntityType).FirstOrDefaultAsync(o => o.EntityId == response.EntityId);
            var date = response == null ? null : await db.Dates.FirstOrDefaultAsync(o => o.DateId == response.DateId);
            if (dateId.HasValue) date = await db.Dates.FirstOrDefaultAsync(o => o.DateId == dateId.Value);

            var sections = await db.Sections.Where(o => o.QuestionnaireId == questionnaire.QuestionnaireId)
                .OrderBy(o => o.SortOrder)
                .ToListAsync();

            var questions = await db.Questions
                .Include(o => o.SkipLogicOptions)
                .Where(o => o.Section.QuestionnaireId == questionnaire.QuestionnaireId)
                // avoid cartesion explosion from includeing skiplogicoptions
                .AsSplitQuery()
                .ToListAsync();

            var questionLookup = questions.ToDictionary(o => o.QuestionId);

            var questionsBySectionId = questions
                .GroupBy(o => o.SectionId)
                .Select(o => new { o.Key, Questions = o.OrderBy(q => q.SortOrder) })
                .ToDictionary(o => o.Key);

            var optionGroups = await db.QuestionOptionGroups
                .Include(o => o.QuestionOptions)
                .Where(o => o.Questions.Any(q => q.Section.QuestionnaireId == questionnaire.QuestionnaireId))
                .ToDictionaryAsync(o => o.QuestionOptionGroupId);

            var answers = response == null
                ? new Dictionary<Guid, Answer>()
                : await db.Answers
                    .Include(o => o.AnswerOptions)
                    .Where(o => o.ResponseId == response.ResponseId)
                    .ToDictionaryAsync(o => o.QuestionId);

            var answerIds = answers.Values.Select(o => o.AnswerId).ToList();
            var documents = response == null
                ? new List<DocumentInfo>()
                : await db.Documents
                    .Where(o => answerIds.Contains(o.ItemId))
                    .Select(o => new DocumentInfo { AnswerId = o.ItemId, FileName = o.FileName })
                    .ToListAsync();

            var answerFont = new Font(baseFont, 9, Font.NORMAL, iTextColors.DARK_GRAY);

            var radioButton = Image.GetInstance(Path.Combine(imagesFolder, "radiobutton.png"));
            radioButton.ScalePercent(10f);
            radioButton.Alignment = Element.ALIGN_LEFT;

            var checkbox = Image.GetInstance(Path.Combine(imagesFolder, "checkbox.png"));
            checkbox.ScalePercent(10f);
            checkbox.Alignment = Element.ALIGN_LEFT;

            var questionSummaries = includeSummaries
                ? await db.QuestionSummaries
                    .Where(o => o.DateId == date.DateId && o.Question.Section.QuestionnaireId == questionnaire.QuestionnaireId)
                    .ToDictionaryAsync(o => o.QuestionId)
                : new Dictionary<Guid, QuestionSummary>();
            #endregion

            byte[] bytes;
            using (ms = new MemoryStream())
            {
                CreateDoc(pageSize: PageSize.A4, hasCoverPage: true);

                #region cover page
                var coverTable = CreateTable(new float[] { 25f, 75f }, spacingBefore: 0);

                if (response != null)
                {
                    coverTable.AddCell(CreateCell(entity.EntityType.Name).SetStyle(CellStyle.Label));
                    coverTable.AddCell(CreateCell(entity.Name).SetStyle(CellStyle.Text));
                }
                if (date != null && (response != null || includeSummaries))
                {
                    coverTable.AddCell(CreateCell("Date").SetStyle(CellStyle.Label));
                    coverTable.AddCell(CreateCell(date.Name).SetStyle(CellStyle.Text));
                }

                AddCoverPage(questionnaire.Name, response != null || includeSummaries ? coverTable : null);
                #endregion;

                foreach (var section in sections)
                {
                    doc.NewPage();

                    doc.Add(new Paragraph(section.Name, h1Font));

                    if (questionsBySectionId.ContainsKey(section.SectionId))
                    {
                        var questionsInSection = questionsBySectionId[section.SectionId].Questions;
                        foreach (var question in questionsInSection)
                        {
                            // todo: should it be a setting to show all questions?
                            if (response != null && !question.ShouldShow(answers)) continue;

                            // write out the skip logic
                            if (includeSkipLogic && question.CheckQuestionId.HasValue)
                            {
                                var logicTable = CreateTable(new float[] { 100f }, spacingBefore: 15f, spacingAfter: 0);

                                var checkQuestion = questionLookup[question.CheckQuestionId.Value];
                                var checkQuestionOptionGroup = optionGroups[checkQuestion.QuestionOptionGroupId.Value];

                                var skipLogic = new Phrase("If the answer to question ", lightFont)
                                {
                                    new Chunk(checkQuestion.Code, mediumFont),
                                    new Chunk(" is ", lightFont)
                                };

                                if (!question.SkipLogicOptions.Any())
                                    throw new HandledException($"Question {question.Code} does not have any Skip Logic options defined");
                                if (question.SkipLogicOptions.Count == 1)
                                    skipLogic.Add(new Chunk(checkQuestionOptionGroup.QuestionOptions.Where(o => o.QuestionOptionId == question.SkipLogicOptions.Single().CheckQuestionOptionId).Single().Label, mediumFont));
                                else
                                {
                                    var counter = 1;
                                    skipLogic.Add(new Chunk("either ", lightFont));
                                    foreach (var skipLogicOption in question.SkipLogicOptions)
                                    {
                                        var questionOption = checkQuestionOptionGroup.QuestionOptions.Where(o => o.QuestionOptionId == skipLogicOption.CheckQuestionOptionId).Single();
                                        if (counter > 1) skipLogic.Add(new Chunk(" or ", lightFont));
                                        skipLogic.Add(new Chunk(questionOption.Label, mediumFont));
                                        counter++;
                                    }
                                }

                                skipLogic.Add(new Phrase(" then ", lightFont));
                                skipLogic.Add(new Phrase(question.SkipLogicAction == SkipLogicAction.Show ? "ask" : "don't ask", lightFont));
                                skipLogic.Add(new Phrase(":", lightFont));

                                var labelCell = CreateCell(new Paragraph(skipLogic)).SetStyle(CellStyle.LightGray);
                                labelCell.Padding = 5f;
                                labelCell.BackgroundColor = new BaseColor(System.Drawing.Color.FromArgb(255, 255, 255));
                                labelCell.BorderColor = new BaseColor(System.Drawing.Color.FromArgb(150, 150, 150));
                                logicTable.AddCell(labelCell);
                                doc.Add(logicTable);
                            }

                            // write out the question text
                            var paragraph = new Paragraph() { SpacingBefore = (includeSkipLogic && question.CheckQuestionId.HasValue ? 0f : 15f), SpacingAfter = 5f };
                            paragraph.Add(new Phrase($"{question.Code}: ", boldFont));
                            paragraph.Add(new Phrase(question.Text, defaultFont));
                            doc.Add(paragraph);

                            // outputting a single response: output the answers
                            if (response != null)
                            {
                                var answer = answers.GetValueOrDefault(question.QuestionId);

                                if (question.QuestionType == QuestionType.Note)
                                {
                                    // nothing to output
                                }
                                else if (question.QuestionType == QuestionType.Text || question.QuestionType == QuestionType.Multiline)
                                {
                                    var answerText = answer?.Value ?? string.Empty;
                                    doc.Add(new Paragraph(answerText, answerFont));
                                }
                                else if (question.QuestionType == QuestionType.OptionList)
                                {
                                    if (question.QuestionOptionGroupId.HasValue && optionGroups.ContainsKey(question.QuestionOptionGroupId.Value))
                                    {
                                        var optionGroup = optionGroups[question.QuestionOptionGroupId.Value];

                                        foreach (var option in optionGroup.QuestionOptions)
                                        {
                                            if (answer != null && answer.AnswerOptions.Any(o => o.QuestionOptionId == option.QuestionOptionId))
                                            {
                                                doc.Add(new Paragraph(option.Label, answerFont));
                                            }
                                        }
                                    }
                                }
                                else if (question.QuestionType == QuestionType.Document)
                                {
                                    if (answer != null)
                                    {
                                        foreach (var document in documents.Where(o => o.AnswerId == answer.AnswerId))
                                        {
                                            doc.Add(new Paragraph(document.FileName, answerFont));
                                        }
                                    }
                                }
                                else
                                    throw new NotImplementedException($"Invalid QuestionType: {question.QuestionType.Label()}");

                            }
                            // outputting without a response: output placeholders for answer
                            else
                            {
                                if (question.QuestionType == QuestionType.OptionList)
                                {
                                    if (!question.QuestionOptionGroupId.HasValue || !optionGroups.ContainsKey(question.QuestionOptionGroupId.Value))
                                        throw new HandledException("Invalid Question Option Group");

                                    var optionGroup = optionGroups[question.QuestionOptionGroupId.Value];

                                    foreach (var option in optionGroup.QuestionOptions.OrderBy(o => o.SortOrder))
                                    {
                                        var optionTable = CreateTable(new float[] { 2f, 98f }, spacingBefore: 0, spacingAfter: 0);

                                        var imageCell = CreateCell(question.OptionListType == Models.OptionListType.Checkboxes ? checkbox : radioButton).SetStyle(CellStyle.NoBorder);
                                        imageCell.PaddingTop = 5f;
                                        optionTable.AddCell(imageCell);

                                        var labelCell = CreateCell(new Paragraph(option.Label, response == null ? defaultFont : answerFont) { SpacingBefore = 0, SpacingAfter = 0 }).SetStyle(CellStyle.NoBorder);
                                        labelCell.SetLeading(1f, 1.25f);
                                        labelCell.PaddingTop = 0f;
                                        optionTable.AddCell(labelCell);
                                        doc.Add(optionTable);
                                    }
                                }
                                else if (question.QuestionType == QuestionType.Text || question.QuestionType == QuestionType.Multiline || question.QuestionType == QuestionType.Document)
                                {
                                    var textTable = CreateTable(new float[] { 100f }, spacingBefore: 0, spacingAfter: 5f);

                                    var text = Environment.NewLine;
                                    if (question.QuestionType == QuestionType.Multiline) text = Environment.NewLine + Environment.NewLine + Environment.NewLine;
                                    else if (question.QuestionType == QuestionType.Document) text = "(Document upload facility)";

                                    var labelCell = CreateCell(new Paragraph(text, answerFont)).SetStyle(CellStyle.LightGray);
                                    labelCell.Padding = 5f;
                                    labelCell.BackgroundColor = new BaseColor(System.Drawing.Color.FromArgb(240, 240, 240));
                                    labelCell.BorderColor = new BaseColor(System.Drawing.Color.FromArgb(180, 180, 180));
                                    textTable.AddCell(labelCell);
                                    doc.Add(textTable);
                                }
                                else if (question.QuestionType == QuestionType.Note)
                                {
                                    // nothing outputts
                                }
                                else
                                    throw new NotImplementedException($"Invalid QuestionType: {question.QuestionType.Label()}");

                                if (includeSummaries && questionSummaries.ContainsKey(question.QuestionId))
                                {
                                    var p = new Paragraph() { SpacingBefore = 5f, SpacingAfter = 5f };
                                    p.Add(new Phrase("SUMMARY: " + questionSummaries[question.QuestionId].Summary, answerFont));
                                    doc.Add(p);
                                }
                            }
                            doc.Add(new Paragraph());
                        }
                    }

                    //if (section.SectionId != sections.Last().SectionId) doc.NewPage();
                }

                bytes = Close();
            }

            return bytes;
        }

        //public void GeneratePlot(IList<DataPoint> series, Stream outputStream)
        //{
        //    using (var ch = new Chart())
        //    {
        //        ch.ChartAreas.Add(new ChartArea());
        //        var s = new Series();
        //        foreach (var pnt in series) s.Points.Add(pnt);
        //        ch.Series.Add(s);
        //        ch.SaveImage(outputStream, ChartImageFormat.Jpeg);
        //    }
        //}

        private class DocumentInfo
        {
            public Guid AnswerId { get; set; }
            public string FileName { get; set; }
        }

        public override string GetReportName()
        {
            return $"Questionnaire.pdf";
        }

        public string GetReportName(bool useName)
        {
            return GetReportName();
        }

        public override string GetContentType()
        {
            return PDFContentType;
        }
    }
}