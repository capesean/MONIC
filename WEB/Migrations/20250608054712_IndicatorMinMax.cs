using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class IndicatorMinMax : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Maximum",
                table: "Indicators",
                type: "decimal(20,8)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Minimum",
                table: "Indicators",
                type: "decimal(20,8)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Maximum",
                table: "Indicators");

            migrationBuilder.DropColumn(
                name: "Minimum",
                table: "Indicators");
        }
    }
}
