using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using WEB.Error;
using WEB.Models;

namespace WEB.Import
{
    public class ImportCSV(ApplicationDbContext db)
    {
        private readonly ApplicationDbContext db = db;
        private readonly List<ImportError> errors = [];
        private List<CSVRow> records = null;
        private Dictionary<string, Entity> entities = null;
        private Dictionary<string, Date> dates = null;
        private Dictionary<string, Indicator> indicators = null;
        private Dictionary<Guid, Dictionary<short, int>> optionLookup = null;

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

            var options = await db.Options
                .ToListAsync();

            optionLookup = options
                .GroupBy(o => o.OptionListId)
                .ToDictionary(
                    grp => grp.Key,
                    grp => grp
                        .GroupBy(o => o.Value ?? short.MinValue) // 'fix' because dictionaries can't have null keys
                        .ToDictionary(
                            sub => sub.Key,
                            sub => sub.Count()
                        )
                );

            var indicatorDateCodes = new Dictionary<Guid, HashSet<string>>();

            using (var ms = new MemoryStream(fileContents))
            using (var stream = new StreamReader(ms))
            using (var csv = new CsvReader(stream, config))
            {
                csv.Context.RegisterClassMap<CSVMap>();

                try
                {
                    records = [.. csv.GetRecords<CSVRow>()];

                    var row = 1;
                    foreach (var record in records)
                    {
                        row++;

                        var indicatorExists = indicators.TryGetValue(record.Indicator, out Indicator indicator);

                        if (!indicatorExists)
                        {
                            errors.Add(new ImportError(row, 1, "Invalid indicator code", record.Indicator));
                            continue;
                        }

                        if (indicator.DataType == DataType.OptionList)
                        {
                            if (!indicator.OptionListId.HasValue || !optionLookup.TryGetValue(indicator.OptionListId.Value, out Dictionary<short, int> value))
                                errors.Add(new ImportError(row, 1, "Option List has not been set for this indicator", null));
                            else if (value.Values.Any(o => o > 1))
                                errors.Add(new ImportError(row, 1, "Option List has multiple options with the same value", null));
                        }

                        if (!entities.ContainsKey(record.Entity))
                            errors.Add(new ImportError(row, 2, "Invalid entity code", record.Entity));

                        var dateExists = dates.TryGetValue(record.Date, out Date date);

                        if (!dateExists)
                            errors.Add(new ImportError(row, 3, "Invalid date code", record.Date));

                        if (dateExists && indicatorExists)
                        {
                            // todo: rename reporting frequency? collection frequency?
                            if (indicator.Frequency != date.DateType)
                                errors.Add(new ImportError(row, 3, "Date (type) mismatch with Reporting Frequency", null));

                            // todo: if indicators have date applicability:
                            if (indicator.UseIndicatorDates)
                            {
                                if (!indicatorDateCodes.ContainsKey(indicator.IndicatorId))
                                    indicatorDateCodes.Add(indicator.IndicatorId, [.. db.IndicatorDates.Where(o => o.IndicatorId == indicator.IndicatorId).Select(o => o.Date.Code)]);

                                if (!indicatorDateCodes[indicator.IndicatorId].Contains(record.Date))
                                    errors.Add(new ImportError(row, 3, "Indicator is not applicable on this Date", null));
                            }

                            if (indicator.Minimum.HasValue && record.Value.HasValue && record.Value < indicator.Minimum)
                                errors.Add(new ImportError(row, 4, "Value is below the minimum allowed for indicator", $"{indicator.Code} ({indicator.Minimum})"));

                            if (indicator.Maximum.HasValue && record.Value.HasValue && record.Value > indicator.Maximum)
                                errors.Add(new ImportError(row, 4, "Value is above the maximum allowed for indicator", $"{indicator.Code} ({indicator.Maximum})"));

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

            var countCheck = records.GroupBy(o => new { o.Entity, o.Indicator, o.Date })
                .Select(o =>
                new
                {
                    o.Key,
                    Count = o.Count()
                })
                .ToList();

            var duplicate = countCheck.FirstOrDefault(o => o.Count > 1);

            if (duplicate != null) errors.Add(new ImportError(null, null, "Duplicate record", $"{duplicate.Key.Indicator}/{duplicate.Key.Entity}/{duplicate.Key.Date}"));

            if (errors.Count == 0 && records.Count == 0) errors.Add(new ImportError(null, null, "No records to import", null));

            return errors.Count == 0;
        }

        public async Task<bool> ImportRecordsAsync(Guid userId, AppSettings appSettings)
        {
            if (errors.Count != 0) throw new InvalidDataException("File contains errors");
            if (records.Count == 0) throw new InvalidDataException("No records");

            var calculateElementIds = new HashSet<Guid>();

            var row = 1;
            foreach (var record in records)
            {
                row++;

                var indicator = indicators[record.Indicator];
                var indicatorId = indicator.IndicatorId;
                var entityId = entities[record.Entity].EntityId;
                var dateId = dates[record.Date].DateId;

                if (indicator.DataType == DataType.OptionList)
                {
                    if (record.Value.HasValue || optionLookup[indicator.OptionListId.Value].ContainsKey(short.MinValue))
                    {
                        if (!optionLookup[indicator.OptionListId.Value].ContainsKey(record.Value.HasValue ? Convert.ToInt16(record.Value.Value) : short.MinValue))
                            errors.Add(
                                new ImportError(
                                    row,
                                    4,
                                    $"Invalid Option List value",
                                    Convert.ToString(record.Value)
                                )
                        );
                    }
                }

                calculateElementIds.Add(indicatorId);

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

            if (errors.Count > 0)
                return false;

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
                var recordsToCalculate = records.Where(o => indicator.Tokens.Any(t => t.SourceIndicatorId == indicators[o.Indicator].IndicatorId));
                foreach (var record in recordsToCalculate)
                {
                    await calculation.CalculateAsync(
                        indicator,
                        [entities[record.Entity].EntityId],
                        [dates[record.Date].DateId]
                        );
                }
            }

            return true;
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

        public class ImportError(int? row, int? column, string error, string contents)
        {
            public int? Row { get; private set; } = row;
            public int? Column { get; private set; } = column;
            public string Error { get; private set; } = error;
            public string Contents { get; private set; } = contents;
        }

        public class CSVRow
        {
            public string Indicator { get; set; }
            public string Entity { get; set; }
            public string Date { get; set; }
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