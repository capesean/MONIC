using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Website3.Migrations
{
    public partial class RemoveTestDates : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TestDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TestDateTime",
                table: "AspNetUsers");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "TestDate",
                table: "AspNetUsers",
                type: "Date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TestDateTime",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
