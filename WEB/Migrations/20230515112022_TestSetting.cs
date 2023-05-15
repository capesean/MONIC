using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Website3.Migrations
{
    /// <inheritdoc />
    public partial class TestSetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TestSetting",
                table: "Settings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TestSetting",
                table: "Settings");
        }
    }
}
