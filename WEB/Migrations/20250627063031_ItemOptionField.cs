using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class ItemOptionField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FieldId",
                table: "ItemOptions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.Sql("""

                update io set io.fieldid = f.fieldid 
                from itemoptions io
                inner join options o on io.OptionId = o.OptionId
                inner join fields f on o.OptionListId = f.OptionListId
                

                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FieldId",
                table: "ItemOptions");
        }
    }
}
