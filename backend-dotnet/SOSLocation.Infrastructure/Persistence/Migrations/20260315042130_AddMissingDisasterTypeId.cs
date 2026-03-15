using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SOSLocation.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingDisasterTypeId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DisasterTypeId",
                table: "DisasterEvents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DisasterEvents_DisasterTypeId",
                table: "DisasterEvents",
                column: "DisasterTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisasterEvents_DisasterTypes_DisasterTypeId",
                table: "DisasterEvents",
                column: "DisasterTypeId",
                principalTable: "DisasterTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisasterEvents_DisasterTypes_DisasterTypeId",
                table: "DisasterEvents");

            migrationBuilder.DropIndex(
                name: "IX_DisasterEvents_DisasterTypeId",
                table: "DisasterEvents");

            migrationBuilder.DropColumn(
                name: "DisasterTypeId",
                table: "DisasterEvents");
        }
    }
}
