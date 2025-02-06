using Microsoft.EntityFrameworkCore;

namespace WEB.Models
{
    public partial class ApplicationDbContext
    {
        public DbSet<Answer> Answers { get; set; }
        public DbSet<AnswerOption> AnswerOptions { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Component> Components { get; set; }
        public DbSet<ComponentIndicator> ComponentIndicators { get; set; }
        public DbSet<DataReview> DataReviews { get; set; }
        public DbSet<DataReviewLink> DataReviewLinks { get; set; }
        public DbSet<Date> Dates { get; set; }
        public DbSet<Datum> Data { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentContent> DocumentContents { get; set; }
        public DbSet<Entity> Entities { get; set; }
        public DbSet<EntityLink> EntityLinks { get; set; }
        public DbSet<EntityPermission> EntityPermissions { get; set; }
        public DbSet<EntityType> EntityTypes { get; set; }
        public DbSet<Field> Fields { get; set; }
        public DbSet<FieldValue> FieldValues { get; set; }
        public DbSet<Folder> Folders { get; set; }
        public DbSet<FolderContent> FolderContents { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Indicator> Indicators { get; set; }
        public DbSet<IndicatorPermission> IndicatorPermissions { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<LogFrame> LogFrames { get; set; }
        public DbSet<LogFrameRow> LogFrameRows { get; set; }
        public DbSet<LogFrameRowComponent> LogFrameRowComponents { get; set; }
        public DbSet<LogFrameRowIndicator> LogFrameRowIndicators { get; set; }
        public DbSet<Milestone> Milestones { get; set; }
        public DbSet<Option> Options { get; set; }
        public DbSet<OptionValue> OptionValues { get; set; }
        public DbSet<Organisation> Organisations { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Questionnaire> Questionnaires { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<QuestionOptionGroup> QuestionOptionGroups { get; set; }
        public DbSet<QuestionSummary> QuestionSummaries { get; set; }
        public DbSet<Relationship> Relationships { get; set; }
        public DbSet<Response> Responses { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Settings> Settings { get; set; }
        public DbSet<SkipLogicOption> SkipLogicOptions { get; set; }
        public DbSet<Subcategory> Subcategories { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<TheoryOfChange> TheoriesOfChange { get; set; }
        public DbSet<TheoryOfChangeComponent> TheoryOfChangeComponents { get; set; }
        public DbSet<Token> Tokens { get; set; }

        public void ConfigureModelBuilder(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Answer>()
                .HasIndex(o => new { o.ResponseId, o.QuestionId})
                .HasDatabaseName("IX_Answers_ResponseId_QuestionId")
                .IsUnique();

            modelBuilder.Entity<AnswerOption>()
                .HasKey(o => new { o.AnswerId, o.QuestionOptionId })
                .HasName("PK_AnswerOption");

            modelBuilder.Entity<Category>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_Category_Name")
                .IsUnique();
            modelBuilder.Entity<Category>()
                .HasIndex(o => o.Code)
                .HasDatabaseName("IX_Category_Code")
                .IsUnique();

            modelBuilder.Entity<Component>()
                .HasIndex(o => o.Code)
                .HasDatabaseName("IX_Component_Code")
                .IsUnique();

            modelBuilder.Entity<ComponentIndicator>()
                .HasKey(o => new { o.ComponentId, o.IndicatorId })
                .HasName("PK_ComponentIndicator");

            modelBuilder.Entity<DataReviewLink>()
                .HasKey(o => new { o.IndicatorId, o.EntityId, o.DateId, o.DataReviewId })
                .HasName("PK_DataReviewLink");

            modelBuilder.Entity<Date>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_Date_Name")
                .IsUnique();
            modelBuilder.Entity<Date>()
                .HasIndex(o => o.Code)
                .HasDatabaseName("IX_Date_Code")
                .IsUnique();

            modelBuilder.Entity<Datum>()
                .HasKey(o => new { o.IndicatorId, o.EntityId, o.DateId })
                .HasName("PK_Datum");


            modelBuilder.Entity<Document>()
                .HasOne(o => o.DocumentContent)
                .WithOne(o => o.Document)
                .HasForeignKey<DocumentContent>(o => o.DocumentId);

            modelBuilder.Entity<DocumentContent>()
                .ToTable("DocumentContents");

            modelBuilder.Entity<Entity>()
                .HasIndex(o => new { o.OrganisationId, o.Name })
                .HasDatabaseName("IX_Entity_Name")
                .IsUnique();
            modelBuilder.Entity<Entity>()
                .HasIndex(o => o.Code)
                .HasDatabaseName("IX_Entity_Code");
// reverted because CSV import needs a unique code
//            modelBuilder.Entity<Entity>()
//                .HasIndex(o => new { o.OrganisationId, o.Code })
//                .HasDatabaseName("IX_Entity_Code")
//                .IsUnique();
            modelBuilder.Entity<Entity>()
                .HasIndex(o => new { o.OrganisationId, o.ShortName })
                .HasDatabaseName("IX_Entity_ShortName")
                .IsUnique();

            modelBuilder.Entity<EntityLink>()
                .HasKey(o => new { o.ChildEntityId, o.ParentEntityId })
                .HasName("PK_EntityLink");

            modelBuilder.Entity<EntityType>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_EntityType_Name")
                .IsUnique();
            modelBuilder.Entity<EntityType>()
                .HasIndex(o => o.Plural)
                .HasDatabaseName("IX_EntityType_Plural")
                .IsUnique();

            modelBuilder.Entity<Field>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_Field_Name")
                .IsUnique();

            modelBuilder.Entity<FieldValue>()
                .HasKey(o => new { o.ItemId, o.FieldId })
                .HasName("PK_FieldValue");

            modelBuilder.Entity<FolderContent>()
                .HasIndex(o => new { o.FolderId, o.Name })
                .HasDatabaseName("IX_FolderContent_Name")
                .IsUnique();

            modelBuilder.Entity<Group>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_Group_Name")
                .IsUnique();

            modelBuilder.Entity<Indicator>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_Indicator_Name")
                .IsUnique();
            modelBuilder.Entity<Indicator>()
                .HasIndex(o => o.Code)
                .HasDatabaseName("IX_Indicator_Code")
                .IsUnique();

            modelBuilder.Entity<LogFrame>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_LogFrame_Name")
                .IsUnique();

            modelBuilder.Entity<LogFrameRowComponent>()
                .HasKey(o => new { o.LogFrameRowId, o.ComponentId })
                .HasName("PK_LogFrameRowComponent");

            modelBuilder.Entity<LogFrameRowIndicator>()
                .HasKey(o => new { o.LogFrameRowId, o.IndicatorId })
                .HasName("PK_LogFrameRowIndicator");

            modelBuilder.Entity<Milestone>()
                .HasIndex(o => new { o.ProjectId, o.Name })
                .HasDatabaseName("IX_Milestone_Name")
                .IsUnique();

            modelBuilder.Entity<Option>()
                .HasIndex(o => new { o.FieldId, o.Name })
                .HasDatabaseName("IX_Option_Name")
                .IsUnique();

            modelBuilder.Entity<OptionValue>()
                .HasKey(o => new { o.ItemId, o.OptionId })
                .HasName("PK_OptionValue");

            modelBuilder.Entity<Organisation>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_Organisation_Name")
                .IsUnique();
            modelBuilder.Entity<Organisation>()
                .HasIndex(o => o.Code)
                .HasDatabaseName("IX_Organisation_Code")
                .IsUnique();

            modelBuilder.Entity<Project>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_Project_Name")
                .IsUnique();

            modelBuilder.Entity<Question>()
                .HasIndex(o => new { o.SectionId, o.Code })
                .HasDatabaseName("IX_Question_Code")
                .IsUnique();

            modelBuilder.Entity<Questionnaire>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_Questionnaire_Name")
                .IsUnique();

            modelBuilder.Entity<QuestionOptionGroup>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_QuestionOptionGroup_Name")
                .IsUnique();

            modelBuilder.Entity<QuestionSummary>()
                .HasKey(o => new { o.QuestionId, o.DateId })
                .HasName("PK_QuestionSummary");

            modelBuilder.Entity<Section>()
                .HasIndex(o => new { o.QuestionnaireId, o.Name })
                .HasDatabaseName("IX_Section_Name")
                .IsUnique();

            modelBuilder.Entity<SkipLogicOption>()
                .HasKey(o => new { o.QuestionId, o.CheckQuestionOptionId })
                .HasName("PK_SkipLogicOption");

            modelBuilder.Entity<Subcategory>()
                .HasIndex(o => o.Code)
                .HasDatabaseName("IX_Subcategory_Code")
                .IsUnique();
            modelBuilder.Entity<Subcategory>()
                .HasIndex(o => new { o.CategoryId, o.Name })
                .HasDatabaseName("IX_Subcategory_Name")
                .IsUnique();

            modelBuilder.Entity<Task>()
                .HasIndex(o => new { o.MilestoneId, o.Name })
                .HasDatabaseName("IX_Task_Name")
                .IsUnique();

            modelBuilder.Entity<TheoryOfChange>()
                .HasIndex(o => o.Name)
                .HasDatabaseName("IX_TheoryOfChange_Name")
                .IsUnique();

            modelBuilder.Entity<TheoryOfChangeComponent>()
                .HasKey(o => new { o.TheoryOfChangeId, o.ComponentId })
                .HasName("PK_TheoryOfChangeComponent");

            modelBuilder.Entity<Token>()
                .HasKey(o => new { o.IndicatorId, o.TokenNumber })
                .HasName("PK_Token");

            modelBuilder.Entity<Date>()
                .HasOne(o => o.Quarter)
                .WithMany(o => o.DatesInQuarter)
                .HasForeignKey(o => o.QuarterId);

            modelBuilder.Entity<Date>()
                .HasOne(o => o.Year)
                .WithMany(o => o.DatesInYear)
                .HasForeignKey(o => o.YearId);

            modelBuilder.Entity<Datum>()
                .HasOne(o => o.SubmitReview)
                .WithMany(o => o.SubmittedData)
                .HasForeignKey(o => o.SubmitDataReviewId);

            modelBuilder.Entity<Datum>()
                .HasOne(o => o.VerifyReview)
                .WithMany(o => o.VerifiedData)
                .HasForeignKey(o => o.VerifyDataReviewId);

            modelBuilder.Entity<Datum>()
                .HasOne(o => o.ApproveReview)
                .WithMany(o => o.ApprovedData)
                .HasForeignKey(o => o.ApproveDataReviewId);

            modelBuilder.Entity<Datum>()
                .HasOne(o => o.RejectReview)
                .WithMany(o => o.RejectedData)
                .HasForeignKey(o => o.RejectDataReviewId);

            modelBuilder.Entity<EntityLink>()
                .HasOne(o => o.ChildEntity)
                .WithMany(o => o.ParentEntities)
                .IsRequired()
                .HasForeignKey(o => o.ChildEntityId);

            modelBuilder.Entity<EntityLink>()
                .HasOne(o => o.ParentEntity)
                .WithMany(o => o.ChildEntities)
                .IsRequired()
                .HasForeignKey(o => o.ParentEntityId);

            modelBuilder.Entity<Relationship>()
                .HasOne(o => o.SourceComponent)
                .WithMany(o => o.RelationshipsAsSource)
                .IsRequired()
                .HasForeignKey(o => o.SourceComponentId);

            modelBuilder.Entity<Relationship>()
                .HasOne(o => o.TargetComponent)
                .WithMany(o => o.RelationshipsAsTarget)
                .IsRequired()
                .HasForeignKey(o => o.TargetComponentId);

            modelBuilder.Entity<Token>()
                .HasOne(o => o.Indicator)
                .WithMany(o => o.Tokens)
                .IsRequired()
                .HasForeignKey(o => o.IndicatorId);

            modelBuilder.Entity<Token>()
                .HasOne(o => o.SourceIndicator)
                .WithMany(o => o.SourceTokens)
                .HasForeignKey(o => o.SourceIndicatorId);

            modelBuilder.Entity<Datum>().Property(o => o.LastSavedDateUtc).HasColumnType("smalldatetime");

            modelBuilder.Entity<Document>().Property(o => o.UploadedOn).HasColumnType("smalldatetime");

            modelBuilder.Entity<FolderContent>().Property(o => o.AddedOn).HasColumnType("smalldatetime");

            modelBuilder.Entity<Indicator>().Property(o => o.CreatedDateUtc).HasColumnType("smalldatetime");

            modelBuilder.Entity<Indicator>().Property(o => o.LastSavedDateUtc).HasColumnType("smalldatetime");

            modelBuilder.Entity<Response>().Property(o => o.CreatedOnUtc).HasColumnType("smalldatetime");

            modelBuilder.Entity<Response>().Property(o => o.LastAnsweredOnUtc).HasColumnType("smalldatetime");

            modelBuilder.Entity<Response>().Property(o => o.SubmittedOnUtc).HasColumnType("smalldatetime");

            modelBuilder.Entity<User>().Property(o => o.LastLoginDate).HasColumnType("smalldatetime");

            modelBuilder.Entity<Datum>()
                .Property(o => o.Approved)
                .HasComputedColumnSql("CONVERT(bit, ISNULL(CASE WHEN ApproveDataReviewId IS NULL THEN 0 ELSE 1 END, 0))");

            modelBuilder.Entity<Datum>()
                .Property(o => o.Rejected)
                .HasComputedColumnSql("CONVERT(bit, ISNULL(CASE WHEN RejectDataReviewId IS NULL THEN 0 ELSE 1 END, 0))");

            modelBuilder.Entity<Datum>()
                .Property(o => o.Submitted)
                .HasComputedColumnSql("CONVERT(bit, ISNULL(CASE WHEN SubmitDataReviewId IS NULL THEN 0 ELSE 1 END, 0))");

            modelBuilder.Entity<Datum>()
                .Property(o => o.Verified)
                .HasComputedColumnSql("CONVERT(bit, ISNULL(CASE WHEN VerifyDataReviewId IS NULL THEN 0 ELSE 1 END, 0))");

            modelBuilder.Entity<Folder>()
                .Property(o => o.RootFolder)
                .HasComputedColumnSql("CONVERT(bit, CASE WHEN ParentFolderId IS NULL THEN 1 ELSE 0 END)");

            modelBuilder.Entity<Response>()
                .Property(o => o.Submitted)
                .HasComputedColumnSql("CONVERT(bit, CASE WHEN SubmittedById IS NOT NULL OR SubmittedOnUtc IS NOT NULL THEN 1 ELSE 0 END)");

            modelBuilder.Entity<User>()
                .Property(o => o.FullName)
                .HasComputedColumnSql("FirstName + ' ' + LastName");

        }

        public void AddNullableUniqueIndexes()
        {
            CreateNullableUniqueIndex("Questionnaires", "PublicCode");
            CreateNullableUniqueIndex("Responses", "PublicCode");
        }
    }
}
