using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class AddOptionLists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Option_Name",
                table: "Options");

            migrationBuilder.AddColumn<Guid>(
                name: "OptionListId",
                table: "Options",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "OptionLists",
                columns: table => new
                {
                    OptionListId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OptionLists", x => x.OptionListId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Option_Name",
                table: "Options",
                columns: new[] { "OptionListId", "Name" },
                unique: true,
                filter: "[OptionListId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Options_FieldId",
                table: "Options",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_OptionList_Name",
                table: "OptionLists",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Options_OptionLists_OptionListId",
                table: "Options",
                column: "OptionListId",
                principalTable: "OptionLists",
                principalColumn: "OptionListId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.Sql("insert into optionlists select fieldid, name from fields where fieldtype = 2");

            migrationBuilder.Sql("UPDATE options set optionlistid = fieldid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Options_OptionLists_OptionListId",
                table: "Options");

            migrationBuilder.DropTable(
                name: "OptionLists");

            migrationBuilder.DropIndex(
                name: "IX_Option_Name",
                table: "Options");

            migrationBuilder.DropIndex(
                name: "IX_Options_FieldId",
                table: "Options");

            migrationBuilder.DropColumn(
                name: "OptionListId",
                table: "Options");

            migrationBuilder.CreateIndex(
                name: "IX_Option_Name",
                table: "Options",
                columns: new[] { "FieldId", "Name" },
                unique: true);
        }
    }
}
