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

            using (var ms = new MemoryStream(fileContents))
            using (var stream = new StreamReader(ms))
            using (var csv = new CsvReader(stream, config))
            {
                csv.Context.TypeConverterOptionsCache
                    .GetOptions<string>()
                    .NullValues.Add(string.Empty);

                csv.Context.RegisterClassMap<CSVMap>();

                try
                {
                    records = [.. csv.GetRecords<CSVRow>()];

                    var neededIndicatorIds = records.Where(r => indicators.ContainsKey(r.IndicatorCode))
                        .Select(r => indicators[r.IndicatorCode].IndicatorId)
                        .Distinct();
                    var indicatorDateCodes = await db.IndicatorDates
                        .Where(id => neededIndicatorIds.Contains(id.IndicatorId))
                        .Select(id => new { id.IndicatorId, id.Date.Code })
                        .ToListAsync();
                    var indicatorDatesByIndicator = indicatorDateCodes
                        .GroupBy(x => x.IndicatorId)
                        .ToDictionary(g => g.Key, g => g.Select(x => x.Code).ToHashSet());

                    var seenKeys = new HashSet<(string entityCode, string indicatorCode, string dateCode)>();

                    var row = 1;

                    foreach (var record in records)
                    {
                        row++;

                        var indicatorExists = indicators.TryGetValue(record.IndicatorCode, out Indicator indicator);

                        if (!indicatorExists)
                        {
                            errors.Add(new ImportError(row, 1, "Invalid indicator code", record.IndicatorCode));
                            continue;
                        }

                        if (indicator.DataType == DataType.OptionList)
                        {
                            if (!indicator.OptionListId.HasValue || !optionLookup.TryGetValue(indicator.OptionListId.Value, out Dictionary<short, int> value))
                                errors.Add(new ImportError(row, 1, "Option List has not been set for this indicator", null));
                            else if (value.Values.Any(o => o > 1))
                                errors.Add(new ImportError(row, 1, "Option List has multiple options with the same value", null));
                        }

                        if (!entities.ContainsKey(record.EntityCode))
                            errors.Add(new ImportError(row, 2, "Invalid entity code", record.EntityCode));

                        var dateExists = dates.TryGetValue(record.DateCode, out Date date);

                        if (!dateExists)
                            errors.Add(new ImportError(row, 3, "Invalid date code", record.DateCode));

                        if (dateExists && indicatorExists)
                        {
                            // todo: rename reporting frequency? collection frequency?
                            if (indicator.Frequency != date.DateType)
                                errors.Add(new ImportError(row, 3, "Date (type) mismatch with Reporting Frequency", null));

                            // todo: if indicators have date applicability:
                            if (indicator.UseIndicatorDates)
                            {
                                if (!indicatorDatesByIndicator[indicator.IndicatorId].Contains(record.DateCode))
                                    errors.Add(new ImportError(row, 3, "Indicator is not applicable on this Date", null));
                            }

                            if (indicator.Minimum.HasValue && record.Value.HasValue && record.Value < indicator.Minimum)
                                errors.Add(new ImportError(row, 4, "Value is below the minimum allowed for indicator", $"{record.Value}"));

                            if (indicator.Maximum.HasValue && record.Value.HasValue && record.Value > indicator.Maximum)
                                errors.Add(new ImportError(row, 4, "Value is above the maximum allowed for indicator", $"{record.Value}"));

                            if (!seenKeys.Add((record.EntityCode, record.IndicatorCode, record.DateCode)))
                                errors.Add(new ImportError(null, null, "Duplicate record", $"{record.IndicatorCode}/{record.EntityCode}/{record.DateCode}"));
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

            if (errors.Count == 0 && records.Count == 0) errors.Add(new ImportError(null, null, "No records to import", null));

            return errors.Count == 0;
        }

        public async Task<bool> ImportRecordsAsync(Guid userId, AppSettings appSettings)
        {
            if (errors.Count != 0) throw new InvalidDataException("File contains errors");
            if (records.Count == 0) throw new InvalidDataException("No records");

            var now = DateTime.UtcNow;
            var dataToSave = new List<Datum>(records.Count);

            var row = 1;
            foreach (var record in records)
            {
                row++;

                var indicator = indicators[record.IndicatorCode];

                if (indicator.DataType == DataType.OptionList)
                {
                    if (record.Value.HasValue || optionLookup[indicator.OptionListId.Value].ContainsKey(short.MinValue))
                    {
                        var optionValue = record.Value.HasValue
                            ? Convert.ToInt16(record.Value.Value)
                            : short.MinValue;

                        if (!optionLookup[indicator.OptionListId.Value].ContainsKey(optionValue))
                        {
                            errors.Add(new ImportError(
                                row,
                                4,
                                "Invalid Option List value",
                                Convert.ToString(record.Value)
                            ));
                        }
                    }
                }

                dataToSave.Add(new Datum
                {
                    IndicatorId = indicator.IndicatorId,
                    EntityId = entities[record.EntityCode].EntityId,
                    DateId = dates[record.DateCode].DateId,
                    Value = record.Value,
                    Note = record.Note,
                    LastSavedById = userId,
                    LastSavedDateUtc = now
                });
            }

            if (errors.Count > 0)
                return false;

            var calculation = new Calculation(db, appSettings, userId);
            await calculation.SaveAsync(dataToSave);

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
            public string IndicatorCode { get; set; }
            public string EntityCode { get; set; }
            public string DateCode { get; set; }
            public decimal? Value { get; set; }
            public string? Note { get; set; }
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