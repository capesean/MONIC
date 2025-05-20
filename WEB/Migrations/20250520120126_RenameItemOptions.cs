using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class RenameItemOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ItemOptions",
                columns: table => new
                {
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemOption", x => new { x.ItemId, x.OptionId });
                    table.ForeignKey(
                        name: "FK_ItemOptions_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ItemOptions_Options_OptionId",
                        column: x => x.OptionId,
                        principalTable: "Options",
                        principalColumn: "OptionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql("INSERT INTO ItemOptions SELECT ItemId, OptionId FROM OptionValues");

            migrationBuilder.DropTable(
                name: "OptionValues");

            migrationBuilder.CreateIndex(
                name: "IX_ItemOptions_OptionId",
                table: "ItemOptions",
                column: "OptionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemOptions");

            migrationBuilder.CreateTable(
                name: "OptionValues",
                columns: table => new
                {
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OptionValue", x => new { x.ItemId, x.OptionId });
                    table.ForeignKey(
                        name: "FK_OptionValues_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OptionValues_Options_OptionId",
                        column: x => x.OptionId,
                        principalTable: "Options",
                        principalColumn: "OptionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OptionValues_OptionId",
                table: "OptionValues",
                column: "OptionId");
        }
    }
}
