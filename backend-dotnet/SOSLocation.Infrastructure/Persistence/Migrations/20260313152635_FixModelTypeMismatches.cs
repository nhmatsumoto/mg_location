using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SOSLocation.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixModelTypeMismatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttentionAlerts_Incidents_IncidentId1",
                table: "AttentionAlerts");

            migrationBuilder.DropForeignKey(
                name: "FK_Donations_Campaigns_CampaignId1",
                table: "Donations");

            migrationBuilder.DropForeignKey(
                name: "FK_FoundPeople_Geolocations_GeolocationId1",
                table: "FoundPeople");

            migrationBuilder.DropForeignKey(
                name: "FK_Hubs_Incidents_IncidentId1",
                table: "Hubs");

            migrationBuilder.DropIndex(
                name: "IX_Hubs_IncidentId1",
                table: "Hubs");

            migrationBuilder.DropIndex(
                name: "IX_FoundPeople_GeolocationId1",
                table: "FoundPeople");

            migrationBuilder.DropIndex(
                name: "IX_Donations_CampaignId1",
                table: "Donations");

            migrationBuilder.DropIndex(
                name: "IX_AttentionAlerts_IncidentId1",
                table: "AttentionAlerts");

            migrationBuilder.DropColumn(
                name: "IncidentId1",
                table: "Hubs");

            migrationBuilder.DropColumn(
                name: "GeolocationId1",
                table: "FoundPeople");

            migrationBuilder.DropColumn(
                name: "CampaignId1",
                table: "Donations");

            migrationBuilder.DropColumn(
                name: "IncidentId1",
                table: "AttentionAlerts");

            migrationBuilder.Sql("ALTER TABLE \"Hubs\" ALTER COLUMN \"IncidentId\" TYPE uuid USING \"IncidentId\"::text::uuid;");

            migrationBuilder.Sql("ALTER TABLE \"FoundPeople\" ALTER COLUMN \"GeolocationId\" TYPE uuid USING \"GeolocationId\"::text::uuid;");

            migrationBuilder.Sql("ALTER TABLE \"Donations\" ALTER COLUMN \"CampaignId\" TYPE uuid USING \"CampaignId\"::text::uuid;");

            migrationBuilder.AlterColumn<string>(
                name: "Severity",
                table: "AttentionAlerts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.Sql("ALTER TABLE \"AttentionAlerts\" ALTER COLUMN \"IncidentId\" TYPE uuid USING \"IncidentId\"::text::uuid;");

            migrationBuilder.AlterColumn<string>(
                name: "ExternalId",
                table: "AttentionAlerts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateIndex(
                name: "IX_Hubs_IncidentId",
                table: "Hubs",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_FoundPeople_GeolocationId",
                table: "FoundPeople",
                column: "GeolocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CampaignId",
                table: "Donations",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_AttentionAlerts_IncidentId",
                table: "AttentionAlerts",
                column: "IncidentId");

            migrationBuilder.AddForeignKey(
                name: "FK_AttentionAlerts_Incidents_IncidentId",
                table: "AttentionAlerts",
                column: "IncidentId",
                principalTable: "Incidents",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Donations_Campaigns_CampaignId",
                table: "Donations",
                column: "CampaignId",
                principalTable: "Campaigns",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_FoundPeople_Geolocations_GeolocationId",
                table: "FoundPeople",
                column: "GeolocationId",
                principalTable: "Geolocations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Hubs_Incidents_IncidentId",
                table: "Hubs",
                column: "IncidentId",
                principalTable: "Incidents",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttentionAlerts_Incidents_IncidentId",
                table: "AttentionAlerts");

            migrationBuilder.DropForeignKey(
                name: "FK_Donations_Campaigns_CampaignId",
                table: "Donations");

            migrationBuilder.DropForeignKey(
                name: "FK_FoundPeople_Geolocations_GeolocationId",
                table: "FoundPeople");

            migrationBuilder.DropForeignKey(
                name: "FK_Hubs_Incidents_IncidentId",
                table: "Hubs");

            migrationBuilder.DropIndex(
                name: "IX_Hubs_IncidentId",
                table: "Hubs");

            migrationBuilder.DropIndex(
                name: "IX_FoundPeople_GeolocationId",
                table: "FoundPeople");

            migrationBuilder.DropIndex(
                name: "IX_Donations_CampaignId",
                table: "Donations");

            migrationBuilder.DropIndex(
                name: "IX_AttentionAlerts_IncidentId",
                table: "AttentionAlerts");

            migrationBuilder.AlterColumn<int>(
                name: "IncidentId",
                table: "Hubs",
                type: "integer",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "IncidentId1",
                table: "Hubs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "GeolocationId",
                table: "FoundPeople",
                type: "integer",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "GeolocationId1",
                table: "FoundPeople",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CampaignId",
                table: "Donations",
                type: "integer",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CampaignId1",
                table: "Donations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Severity",
                table: "AttentionAlerts",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<int>(
                name: "IncidentId",
                table: "AttentionAlerts",
                type: "integer",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ExternalId",
                table: "AttentionAlerts",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<Guid>(
                name: "IncidentId1",
                table: "AttentionAlerts",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hubs_IncidentId1",
                table: "Hubs",
                column: "IncidentId1");

            migrationBuilder.CreateIndex(
                name: "IX_FoundPeople_GeolocationId1",
                table: "FoundPeople",
                column: "GeolocationId1");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CampaignId1",
                table: "Donations",
                column: "CampaignId1");

            migrationBuilder.CreateIndex(
                name: "IX_AttentionAlerts_IncidentId1",
                table: "AttentionAlerts",
                column: "IncidentId1");

            migrationBuilder.AddForeignKey(
                name: "FK_AttentionAlerts_Incidents_IncidentId1",
                table: "AttentionAlerts",
                column: "IncidentId1",
                principalTable: "Incidents",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Donations_Campaigns_CampaignId1",
                table: "Donations",
                column: "CampaignId1",
                principalTable: "Campaigns",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_FoundPeople_Geolocations_GeolocationId1",
                table: "FoundPeople",
                column: "GeolocationId1",
                principalTable: "Geolocations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Hubs_Incidents_IncidentId1",
                table: "Hubs",
                column: "IncidentId1",
                principalTable: "Incidents",
                principalColumn: "Id");
        }
    }
}
