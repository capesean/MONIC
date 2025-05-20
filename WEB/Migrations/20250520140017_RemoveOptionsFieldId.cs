using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOptionsFieldId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Options_Fields_FieldId",
                table: "Options");

            migrationBuilder.DropIndex(
                name: "IX_Options_FieldId",
                table: "Options");

            migrationBuilder.DropColumn(
                name: "FieldId",
                table: "Options");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FieldId",
                table: "Options",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Options_FieldId",
                table: "Options",
                column: "FieldId");

            migrationBuilder.AddForeignKey(
                name: "FK_Options_Fields_FieldId",
                table: "Options",
                column: "FieldId",
                principalTable: "Fields",
                principalColumn: "FieldId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
