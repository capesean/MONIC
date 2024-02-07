using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WEB.Migrations
{
    /// <inheritdoc />
    public partial class CalculatedColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "Submitted",
                table: "Responses",
                type: "bit",
                nullable: false,
                computedColumnSql: "CONVERT(bit, CASE WHEN SubmittedById IS NOT NULL OR SubmittedOnUtc IS NOT NULL THEN 1 ELSE 0 END)",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "RootFolder",
                table: "Folders",
                type: "bit",
                nullable: false,
                computedColumnSql: "CONVERT(bit, CASE WHEN ParentFolderId IS NULL THEN 1 ELSE 0 END)",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "Verified",
                table: "Data",
                type: "bit",
                nullable: false,
                computedColumnSql: "CONVERT(bit, ISNULL(CASE WHEN VerifyDataReviewId IS NULL THEN 0 ELSE 1 END, 0))",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "Submitted",
                table: "Data",
                type: "bit",
                nullable: false,
                computedColumnSql: "CONVERT(bit, ISNULL(CASE WHEN SubmitDataReviewId IS NULL THEN 0 ELSE 1 END, 0))",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "Rejected",
                table: "Data",
                type: "bit",
                nullable: false,
                computedColumnSql: "CONVERT(bit, ISNULL(CASE WHEN RejectDataReviewId IS NULL THEN 0 ELSE 1 END, 0))",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "Approved",
                table: "Data",
                type: "bit",
                nullable: false,
                computedColumnSql: "CONVERT(bit, ISNULL(CASE WHEN ApproveDataReviewId IS NULL THEN 0 ELSE 1 END, 0))",
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                computedColumnSql: "FirstName + ' ' + LastName",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "Submitted",
                table: "Responses",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldComputedColumnSql: "CONVERT(bit, CASE WHEN SubmittedById IS NOT NULL OR SubmittedOnUtc IS NOT NULL THEN 1 ELSE 0 END)");

            migrationBuilder.AlterColumn<bool>(
                name: "RootFolder",
                table: "Folders",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldComputedColumnSql: "CONVERT(bit, CASE WHEN ParentFolderId IS NULL THEN 1 ELSE 0 END)");

            migrationBuilder.AlterColumn<bool>(
                name: "Verified",
                table: "Data",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldComputedColumnSql: "CONVERT(bit, ISNULL(CASE WHEN VerifyDataReviewId IS NULL THEN 0 ELSE 1 END, 0))");

            migrationBuilder.AlterColumn<bool>(
                name: "Submitted",
                table: "Data",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldComputedColumnSql: "CONVERT(bit, ISNULL(CASE WHEN SubmitDataReviewId IS NULL THEN 0 ELSE 1 END, 0))");

            migrationBuilder.AlterColumn<bool>(
                name: "Rejected",
                table: "Data",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldComputedColumnSql: "CONVERT(bit, ISNULL(CASE WHEN RejectDataReviewId IS NULL THEN 0 ELSE 1 END, 0))");

            migrationBuilder.AlterColumn<bool>(
                name: "Approved",
                table: "Data",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldComputedColumnSql: "CONVERT(bit, ISNULL(CASE WHEN ApproveDataReviewId IS NULL THEN 0 ELSE 1 END, 0))");

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldComputedColumnSql: "FirstName + ' ' + LastName");
        }
    }
}
