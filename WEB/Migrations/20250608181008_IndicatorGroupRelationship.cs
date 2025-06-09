using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class IndicatorGroupRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "GroupingIndicatorId",
                table: "Indicators",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Indicators_GroupingIndicatorId",
                table: "Indicators",
                column: "GroupingIndicatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Indicators_Indicators_GroupingIndicatorId",
                table: "Indicators",
                column: "GroupingIndicatorId",
                principalTable: "Indicators",
                principalColumn: "IndicatorId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Indicators_Indicators_GroupingIndicatorId",
                table: "Indicators");

            migrationBuilder.DropIndex(
                name: "IX_Indicators_GroupingIndicatorId",
                table: "Indicators");

            migrationBuilder.DropColumn(
                name: "GroupingIndicatorId",
                table: "Indicators");
        }
    }
}
