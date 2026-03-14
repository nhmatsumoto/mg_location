using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SOSLocation.Infrastructure.Persistence;

#nullable disable

namespace SOSLocation.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(SOSLocationDbContext))]
    [Migration("20260314161000_EnsureDisasterTypesTableExists")]
    public class EnsureDisasterTypesTableExists : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"CREATE TABLE IF NOT EXISTS ""DisasterTypes"" (
                    ""Id"" uuid NOT NULL,
                    ""Name"" character varying(50) NOT NULL,
                    ""Code"" character varying(20) NOT NULL,
                    ""Description"" character varying(500) NOT NULL,
                    ""Icon"" character varying(50) NOT NULL,
                    ""Color"" character varying(7) NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""UpdatedAt"" timestamp with time zone NOT NULL,
                    CONSTRAINT ""PK_DisasterTypes"" PRIMARY KEY (""Id"")
                );");

            migrationBuilder.Sql(
                @"CREATE UNIQUE INDEX IF NOT EXISTS ""IX_DisasterTypes_Code""
                  ON ""DisasterTypes"" (""Code"");");

            migrationBuilder.Sql(
                @"DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'DisasterEvents'
                          AND column_name = 'DisasterTypeId'
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = 'FK_DisasterEvents_DisasterTypes_DisasterTypeId'
                    ) THEN
                        ALTER TABLE ""DisasterEvents""
                            ADD CONSTRAINT ""FK_DisasterEvents_DisasterTypes_DisasterTypeId""
                            FOREIGN KEY (""DisasterTypeId"")
                            REFERENCES ""DisasterTypes"" (""Id"")
                            ON DELETE RESTRICT;
                    END IF;
                END $$;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE IF EXISTS ""DisasterEvents""
                  DROP CONSTRAINT IF EXISTS ""FK_DisasterEvents_DisasterTypes_DisasterTypeId"";");

            migrationBuilder.DropTable(
                name: "DisasterTypes");
        }
    }
}
