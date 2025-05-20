using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class OptionListIdNotNull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Option_Name",
                table: "Options");

            migrationBuilder.AlterColumn<Guid>(
                name: "OptionListId",
                table: "Options",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Option_Name",
                table: "Options",
                columns: new[] { "OptionListId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Option_Name",
                table: "Options");

            migrationBuilder.AlterColumn<Guid>(
                name: "OptionListId",
                table: "Options",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_Option_Name",
                table: "Options",
                columns: new[] { "OptionListId", "Name" },
                unique: true,
                filter: "[OptionListId] IS NOT NULL");
        }
    }
}
