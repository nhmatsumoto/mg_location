using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SOSLocation.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIntegratedDataModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Lat",
                table: "Incidents",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Lon",
                table: "Incidents",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateTable(
                name: "MeteorologicalData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false),
                    LocationName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Temperature = table.Column<double>(type: "double precision", nullable: false),
                    Humidity = table.Column<double>(type: "double precision", nullable: false),
                    WindSpeed = table.Column<double>(type: "double precision", nullable: false),
                    Condition = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    rawDataJson = table.Column<string>(type: "text", nullable: false),
                    CapturedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeteorologicalData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RiskAnalysis",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false),
                    LocationName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Score = table.Column<double>(type: "double precision", nullable: false),
                    Level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FactorsJson = table.Column<string>(type: "text", nullable: false),
                    AnalysisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RelatedIncidentId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RiskAnalysis", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MeteorologicalData");

            migrationBuilder.DropTable(
                name: "RiskAnalysis");

            migrationBuilder.DropColumn(
                name: "Lat",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "Lon",
                table: "Incidents");
        }
    }
}
