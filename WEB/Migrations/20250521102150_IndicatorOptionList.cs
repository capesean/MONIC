using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class IndicatorOptionList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OptionListId",
                table: "Indicators",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Indicators_OptionListId",
                table: "Indicators",
                column: "OptionListId");

            migrationBuilder.AddForeignKey(
                name: "FK_Indicators_OptionLists_OptionListId",
                table: "Indicators",
                column: "OptionListId",
                principalTable: "OptionLists",
                principalColumn: "OptionListId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Indicators_OptionLists_OptionListId",
                table: "Indicators");

            migrationBuilder.DropIndex(
                name: "IX_Indicators_OptionListId",
                table: "Indicators");

            migrationBuilder.DropColumn(
                name: "OptionListId",
                table: "Indicators");
        }
    }
}
