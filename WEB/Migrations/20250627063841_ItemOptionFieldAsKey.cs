using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class ItemOptionFieldAsKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ItemOption",
                table: "ItemOptions");

            migrationBuilder.AlterColumn<Guid>(
                name: "FieldId",
                table: "ItemOptions",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ItemOption",
                table: "ItemOptions",
                columns: new[] { "ItemId", "FieldId", "OptionId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ItemOption",
                table: "ItemOptions");

            migrationBuilder.AlterColumn<Guid>(
                name: "FieldId",
                table: "ItemOptions",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ItemOption",
                table: "ItemOptions",
                columns: new[] { "ItemId", "OptionId" });
        }
    }
}
