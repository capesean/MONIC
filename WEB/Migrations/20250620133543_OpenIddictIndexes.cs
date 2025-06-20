using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class OpenIddictIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE INDEX IX_Tokens_Subject_CreationDate ON OpenIddictTokens(Subject, CreationDate);");
            migrationBuilder.Sql("CREATE INDEX IX_Tokens_AuthorizationId ON OpenIddictTokens(AuthorizationId);");
            migrationBuilder.Sql("CREATE INDEX IX_Auth_Subject_CreationDate  ON OpenIddictAuthorizations(Subject, CreationDate);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX OpenIddictTokens.IX_Tokens_Subject_CreationDate;");
            migrationBuilder.Sql("DROP INDEX OpenIddictTokens.IX_Tokens_AuthorizationId;");
            migrationBuilder.Sql("DROP INDEX OpenIddictAuthorizations.IX_Auth_Subject_CreationDate;");
        }
    }
}
