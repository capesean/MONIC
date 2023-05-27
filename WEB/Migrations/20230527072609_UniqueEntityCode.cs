using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class UniqueEntityCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Entity_Code",
                table: "Entities");

            migrationBuilder.CreateIndex(
                name: "IX_Entity_Code",
                table: "Entities",
                column: "Code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Entity_Code",
                table: "Entities");

            migrationBuilder.CreateIndex(
                name: "IX_Entity_Code",
                table: "Entities",
                columns: new[] { "OrganisationId", "Code" },
                unique: true,
                filter: "[OrganisationId] IS NOT NULL");
        }
    }
}
