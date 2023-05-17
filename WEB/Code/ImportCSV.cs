using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using WEB.Error;
using WEB.Models;

namespace WEB.Import
{
    public class ImportCSV
    {
        private ApplicationDbContext db;
        private List<ImportError> errors = new List<ImportError>();
        private List<CSVRow> records = null;
        private Dictionary<string, Entity> entities = null;
        private Dictionary<string, Date> dates = null;
        private Dictionary<string, Indicator> indicators = null;

        public ImportCSV(ApplicationDbContext db)
        {
            this.db = db;
        }

        public List<ImportError> GetErrors()
        {
            return errors;
        }

        public async Task<bool> ProcessCSV(byte[] fileContents)
        {
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                Delimiter = ",",
                TrimOptions = TrimOptions.Trim,
                ReadingExceptionOccurred = ReadingExceptionOccurred
            };

            indicators = await db.Indicators.ToDictionaryAsync(o => o.Code, o => o);
            entities = await db.Entities.ToDictionaryAsync(o => o.Code, o => o);
            dates = await db.Dates.ToDictionaryAsync(o => o.Code, o => o);

            using (var ms = new MemoryStream(fileContents))
            using (var stream = new StreamReader(ms))
            using (var csv = new CsvReader(stream, config))
            {
                csv.Context.RegisterClassMap<CSVMap>();

                try
                {
                    records = csv.GetRecords<CSVRow>().ToList();

                    var row = 1;
                    foreach (var record in records)
                    {
                        row++;

                        Indicator indicator = null;
                        var indicatorExists = indicators.TryGetValue(record.IndicatorCode, out indicator);

                        if (!indicatorExists)
                            errors.Add(new ImportError(row, 1, "Invalid indicator code", record.IndicatorCode));

                        if (!entities.ContainsKey(record.EntityCode))
                            errors.Add(new ImportError(row, 2, "Invalid entity code", record.EntityCode));

                        Date date = null;
                        var dateExists = dates.TryGetValue(record.DateCode, out date);

                        if (!dateExists)
                            errors.Add(new ImportError(row, 3, "Invalid date code", record.DateCode));

                        if (dateExists && indicatorExists)
                        {
                            // todo: rename reporting frequency? collection frequency?
                            if (indicator.ReportingFrequency != date.DateType)
                                errors.Add(new ImportError(row, 3, "Date (type) mismatch with Reporting Frequency", null));

                            // todo: if indicators have date applicability:
                            //if (!indicator.IndicatorDates.Any(o => o.DateId == date.DateId))
                            //    errors.Add(new ImportError(row, 3, "Indicator is not applicable on this Date", null));
                        }

                    }
                }
                catch (HeaderValidationException err)
                {
                    throw new HandledException("The following headers were not found: " + string.Join(", ", err.InvalidHeaders.Select(o => o.Names[0])));
                }
                catch 
                {
                    throw;
                }
            }

            var countCheck = records.GroupBy(o => new { o.EntityCode, o.IndicatorCode, o.DateCode })
                .Select(o =>
                new
                {
                    o.Key,
                    Count = o.Count()
                })
                .ToList();

            var duplicate = countCheck.FirstOrDefault(o => o.Count > 1);

            if (duplicate != null) errors.Add(new ImportError(null, null, "Duplicate record", $"{duplicate.Key.IndicatorCode}/{duplicate.Key.EntityCode}/{duplicate.Key.DateCode}"));

            if (!errors.Any() && !records.Any()) errors.Add(new ImportError(null, null, "No records to import", null));

            return !errors.Any();
        }

        public async System.Threading.Tasks.Task ImportRecordsAsync(Guid userId, AppSettings appSettings)
        {
            if (errors.Any()) throw new InvalidDataException("File contains errors");
            if (!records.Any()) throw new InvalidDataException("No records");

            var calculateElementIds = new HashSet<Guid>();

            foreach (var record in records)
            {
                var indicator = indicators[record.IndicatorCode];
                var indicatorId = indicator.IndicatorId;
                var entityId = entities[record.EntityCode].EntityId;
                var dateId = dates[record.DateCode].DateId;

                if (!calculateElementIds.Contains(indicatorId)) calculateElementIds.Add(indicatorId);

                var datum = db.Data.FirstOrDefault(
                    o => o.IndicatorId == indicatorId
                    && o.EntityId == entityId
                    && o.DateId == dateId
                    );

                if (datum == null)
                {
                    datum = new Datum
                    {
                        IndicatorId = indicatorId,
                        EntityId = entityId,
                        DateId = dateId,
                    };
                    db.Entry(datum).State = EntityState.Added;
                }
                else
                {
                    db.Entry(datum).State = EntityState.Modified;
                }

                datum.LastSavedById = userId;
                datum.LastSavedDateUtc = DateTime.Now;
                datum.Value = record.Value;
                datum.Note = record.Note;

                // todo: what about submit, verify & approve?
            }

            await db.SaveChangesAsync();

            var indicatorIds = calculateElementIds.ToArray();

            var indicatorsToCalculate = db.Indicators
                .Include(o => o.Tokens)
                .ThenInclude(o => o.SourceIndicator)
                .Where(o => o.Tokens.Any(t => indicatorIds.Contains(t.SourceIndicatorId ?? Guid.Empty)))
                .ToList();

            // not optimal?
            var calculation = new Calculation(db, appSettings, userId);
            foreach (var indicator in indicatorsToCalculate)
            {
                var recordsToCalculate = records.Where(o => indicator.Tokens.Any(t => t.SourceIndicatorId == indicators[o.IndicatorCode].IndicatorId));
                foreach (var record in recordsToCalculate)
                {
                    await calculation.CalculateAsync(
                        indicator,
                        new List<Guid> { entities[record.EntityCode].EntityId },
                        new List<Guid> { dates[record.DateCode].DateId }
                        );
                }
            }
        }

        private bool ReadingExceptionOccurred(ReadingExceptionOccurredArgs args)
        {
            errors.Add(
                new ImportError(
                    args.Exception.Context.Parser.Row,
                    args.Exception.Context.Reader.CurrentIndex + 1,
                    $"Unable to read the value for field '{args.Exception.Context.Reader.HeaderRecord[args.Exception.Context.Reader.CurrentIndex]}'",
                    args.Exception.Context.Parser.Record[args.Exception.Context.Reader.CurrentIndex]
                )
            );

            return false;
        }

        public class ImportError
        {
            public int? Row { get; private set; }
            public int? Column { get; private set; }
            public string Error { get; private set; }
            public string Contents { get; private set; }

            public ImportError(int? row, int? column, string error, string contents)
            {
                Row = row;
                Column = column;
                Error = error;
                Contents = contents;
            }
        }

        public class CSVRow
        {
            public string IndicatorCode { get; set; }
            public string EntityCode { get; set; }
            public string DateCode { get; set; }
            public decimal? Value { get; set; }
            public string Note { get; set; }
        }

        public sealed class CSVMap : ClassMap<CSVRow>
        {
            public CSVMap()
            {
                AutoMap(CultureInfo.InvariantCulture);
            }
        }
    }

}