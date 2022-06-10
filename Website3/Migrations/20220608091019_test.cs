using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Website3.Migrations
{
    public partial class test : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Enabled",
                table: "AspNetUsers",
                newName: "Disabled");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Disabled",
                table: "AspNetUsers",
                newName: "Enabled");
        }
    }
}
