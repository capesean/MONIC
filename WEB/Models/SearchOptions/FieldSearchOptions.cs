namespace WEB.Models
{
    public class FieldSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public FieldType? FieldType { get; set; }

        public bool? Organisation { get; set; }

        public bool? Entity { get; set; }

        public bool? Indicator { get; set; }

        public Guid? GroupId { get; set; }

    }
}
