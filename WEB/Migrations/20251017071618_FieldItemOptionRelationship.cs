using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class FieldItemOptionRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ItemOptions_FieldId",
                table: "ItemOptions",
                column: "FieldId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemOptions_Fields_FieldId",
                table: "ItemOptions",
                column: "FieldId",
                principalTable: "Fields",
                principalColumn: "FieldId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemOptions_Fields_FieldId",
                table: "ItemOptions");

            migrationBuilder.DropIndex(
                name: "IX_ItemOptions_FieldId",
                table: "ItemOptions");
        }
    }
}
