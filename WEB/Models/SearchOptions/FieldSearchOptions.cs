namespace WEB.Models
{
    public class FieldSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public FieldType? FieldType { get; set; }

        public bool? Organisation { get; set; }

        public bool? Entity { get; set; }

        public bool? Indicator { get; set; }

        public bool? Component { get; set; }

        public bool? Relationship { get; set; }

        public bool? Folder { get; set; }

        public bool? Category { get; set; }

        public bool? Subcategory { get; set; }

        public Guid? GroupId { get; set; }

    }
}
