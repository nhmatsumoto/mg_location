using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SOSLocation.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialFull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CollapseReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    LocationName = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ReporterName = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    ReporterPhone = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    VideoFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    StoredVideoPath = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    VideoSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    ProcessingStatus = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    SplatPipelineHint = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CollapseReports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DisasterEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ProviderEventId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EventType = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    StartAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Lat = table.Column<float>(type: "real", nullable: false),
                    Lon = table.Column<float>(type: "real", nullable: false),
                    CountryCode = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    CountryName = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    SourceUrl = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisasterEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Geolocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Geolocations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Country = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Region = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    StartsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MapAnnotations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    RecordType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Lat = table.Column<double>(type: "double precision", nullable: false),
                    Lng = table.Column<double>(type: "double precision", nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RadiusMeters = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    MetadataJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MapAnnotations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RescueGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Members = table.Column<int>(type: "integer", nullable: false),
                    Specialty = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Lat = table.Column<double>(type: "double precision", nullable: true),
                    Lng = table.Column<double>(type: "double precision", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RescueGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RescueTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    ExternalId = table.Column<Guid>(type: "uuid", nullable: true),
                    Team = table.Column<string>(type: "character varying(140)", maxLength: 140, nullable: false),
                    Location = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RescueTasks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SimulationAreas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    BboxMinLat = table.Column<double>(type: "double precision", nullable: false),
                    BboxMinLng = table.Column<double>(type: "double precision", nullable: false),
                    BboxMaxLat = table.Column<double>(type: "double precision", nullable: false),
                    BboxMaxLng = table.Column<double>(type: "double precision", nullable: false),
                    PolygonGeometryJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SimulationAreas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SupplyLogistics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    Item = table.Column<string>(type: "character varying(140)", maxLength: 140, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    Unit = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Origin = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Destination = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplyLogistics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FoundPeople",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    GeolocationId = table.Column<int>(type: "integer", nullable: true),
                    GeolocationId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    Gender = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    StatusCondition = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoundPeople", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FoundPeople_Geolocations_GeolocationId1",
                        column: x => x.GeolocationId1,
                        principalTable: "Geolocations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "VisitedLocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    GeolocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    VisitationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EncounterNumber = table.Column<int>(type: "integer", nullable: false),
                    Radius = table.Column<double>(type: "double precision", nullable: false),
                    Observations = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitedLocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VisitedLocations_Geolocations_GeolocationId",
                        column: x => x.GeolocationId,
                        principalTable: "Geolocations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AttentionAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Lat = table.Column<double>(type: "double precision", nullable: false),
                    Lng = table.Column<double>(type: "double precision", nullable: false),
                    RadiusMeters = table.Column<int>(type: "integer", nullable: false),
                    IncidentId = table.Column<int>(type: "integer", nullable: true),
                    IncidentId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttentionAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttentionAlerts_Incidents_IncidentId1",
                        column: x => x.IncidentId1,
                        principalTable: "Incidents",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Campaigns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    GoalAmount = table.Column<double>(type: "double precision", nullable: false),
                    CurrentAmount = table.Column<double>(type: "double precision", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "Incidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<Guid>(type: "uuid", nullable: true),
                    Description = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Amount = table.Column<double>(type: "double precision", nullable: false),
                    Category = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "Incidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Hubs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HubId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    LocalIp = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    IncidentId = table.Column<int>(type: "integer", nullable: true),
                    IncidentId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hubs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hubs_Incidents_IncidentId1",
                        column: x => x.IncidentId1,
                        principalTable: "Incidents",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MissingPersons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PersonName = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Age = table.Column<int>(type: "integer", nullable: true),
                    City = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    LastSeenLocation = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Lat = table.Column<double>(type: "double precision", nullable: true),
                    Lng = table.Column<double>(type: "double precision", nullable: true),
                    PhysicalDescription = table.Column<string>(type: "text", nullable: false),
                    AdditionalInfo = table.Column<string>(type: "text", nullable: false),
                    ContactName = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Source = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    IncidentId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MissingPersons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MissingPersons_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "Incidents",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PublicSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uuid", nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataJson = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PublicSnapshots_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "Incidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SearchAreas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    GeometryJson = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SearchAreas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SearchAreas_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "Incidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScenarioBundles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AreaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TerrainPath = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    BuildingsPath = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    ParametersJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScenarioBundles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScenarioBundles_SimulationAreas_AreaId",
                        column: x => x.AreaId,
                        principalTable: "SimulationAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Donations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<Guid>(type: "uuid", nullable: true),
                    CampaignId = table.Column<int>(type: "integer", nullable: true),
                    CampaignId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    Amount = table.Column<double>(type: "double precision", nullable: false),
                    DonorName = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Donations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Donations_Campaigns_CampaignId1",
                        column: x => x.CampaignId1,
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Donations_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "Incidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Assignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<Guid>(type: "uuid", nullable: true),
                    SearchAreaId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedToUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    AssignedToTeamId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Assignments_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "Incidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Assignments_SearchAreas_SearchAreaId",
                        column: x => x.SearchAreaId,
                        principalTable: "SearchAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SimulationRuns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ScenarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    WaterLevelStart = table.Column<double>(type: "double precision", nullable: false),
                    RainfallMm = table.Column<double>(type: "double precision", nullable: false),
                    DurationHours = table.Column<double>(type: "double precision", nullable: false),
                    MetricsJson = table.Column<string>(type: "text", nullable: false),
                    ArtifactsJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SimulationRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SimulationRuns_ScenarioBundles_ScenarioId",
                        column: x => x.ScenarioId,
                        principalTable: "ScenarioBundles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_IncidentId",
                table: "Assignments",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_SearchAreaId",
                table: "Assignments",
                column: "SearchAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_AttentionAlerts_IncidentId1",
                table: "AttentionAlerts",
                column: "IncidentId1");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_IncidentId",
                table: "Campaigns",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_CollapseReports_ExternalId",
                table: "CollapseReports",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DisasterEvents_Provider_ProviderEventId",
                table: "DisasterEvents",
                columns: new[] { "Provider", "ProviderEventId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CampaignId1",
                table: "Donations",
                column: "CampaignId1");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_IncidentId",
                table: "Donations",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_IncidentId",
                table: "Expenses",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_FoundPeople_GeolocationId1",
                table: "FoundPeople",
                column: "GeolocationId1");

            migrationBuilder.CreateIndex(
                name: "IX_Hubs_IncidentId1",
                table: "Hubs",
                column: "IncidentId1");

            migrationBuilder.CreateIndex(
                name: "IX_MapAnnotations_ExternalId",
                table: "MapAnnotations",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MissingPersons_ExternalId",
                table: "MissingPersons",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MissingPersons_IncidentId",
                table: "MissingPersons",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_PublicSnapshots_IncidentId",
                table: "PublicSnapshots",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_ScenarioBundles_AreaId",
                table: "ScenarioBundles",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_SearchAreas_IncidentId",
                table: "SearchAreas",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_SimulationRuns_ScenarioId",
                table: "SimulationRuns",
                column: "ScenarioId");

            migrationBuilder.CreateIndex(
                name: "IX_VisitedLocations_GeolocationId",
                table: "VisitedLocations",
                column: "GeolocationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "AttentionAlerts");

            migrationBuilder.DropTable(
                name: "CollapseReports");

            migrationBuilder.DropTable(
                name: "DisasterEvents");

            migrationBuilder.DropTable(
                name: "Donations");

            migrationBuilder.DropTable(
                name: "Expenses");

            migrationBuilder.DropTable(
                name: "FoundPeople");

            migrationBuilder.DropTable(
                name: "Hubs");

            migrationBuilder.DropTable(
                name: "MapAnnotations");

            migrationBuilder.DropTable(
                name: "MissingPersons");

            migrationBuilder.DropTable(
                name: "PublicSnapshots");

            migrationBuilder.DropTable(
                name: "RescueGroups");

            migrationBuilder.DropTable(
                name: "RescueTasks");

            migrationBuilder.DropTable(
                name: "SimulationRuns");

            migrationBuilder.DropTable(
                name: "SupplyLogistics");

            migrationBuilder.DropTable(
                name: "VisitedLocations");

            migrationBuilder.DropTable(
                name: "SearchAreas");

            migrationBuilder.DropTable(
                name: "Campaigns");

            migrationBuilder.DropTable(
                name: "ScenarioBundles");

            migrationBuilder.DropTable(
                name: "Geolocations");

            migrationBuilder.DropTable(
                name: "Incidents");

            migrationBuilder.DropTable(
                name: "SimulationAreas");
        }
    }
}
