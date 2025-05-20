using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class FieldOptionListLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OptionListId",
                table: "Fields",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Fields_OptionListId",
                table: "Fields",
                column: "OptionListId");

            migrationBuilder.AddForeignKey(
                name: "FK_Fields_OptionLists_OptionListId",
                table: "Fields",
                column: "OptionListId",
                principalTable: "OptionLists",
                principalColumn: "OptionListId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.Sql("update fields set optionlistid = fieldid where fieldtype = 2");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fields_OptionLists_OptionListId",
                table: "Fields");

            migrationBuilder.DropIndex(
                name: "IX_Fields_OptionListId",
                table: "Fields");

            migrationBuilder.DropColumn(
                name: "OptionListId",
                table: "Fields");
        }
    }
}
