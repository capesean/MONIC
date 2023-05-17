namespace WEB.Models
{
    public class LogFrameRowSearchOptions : SearchOptions
    {
        public string q { get; set; }

        public Guid? LogFrameId { get; set; }

        public LogFrameRowType? RowType { get; set; }

    }
}
