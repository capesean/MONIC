namespace WEB.Models
{
    public class DateSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public DateType? DateType { get; set; }

        public Guid? QuarterId { get; set; }

        public Guid? YearId { get; set; }

        public bool? IsOpen { get; set; }

        public bool? HasOpened { get; set; }

    }
}
