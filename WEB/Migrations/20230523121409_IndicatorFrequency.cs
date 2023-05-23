using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class IndicatorFrequency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ReportingFrequency",
                table: "Indicators",
                newName: "Frequency");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Frequency",
                table: "Indicators",
                newName: "ReportingFrequency");
        }
    }
}
