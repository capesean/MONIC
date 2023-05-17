namespace WEB.Models
{
    public class RelationshipSearchOptions : SearchOptions
    {
        public Guid? TheoryOfChangeId { get; set; }

        public Guid? SourceComponentId { get; set; }

        public Guid? TargetComponentId { get; set; }

    }
}
