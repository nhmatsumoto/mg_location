using Microsoft.EntityFrameworkCore;
using SOSLocation.API.Models;

namespace SOSLocation.API.Data
{
    public class SOSLocationDbContext : DbContext
    {
        public SOSLocationDbContext(DbContextOptions<SOSLocationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Incident> Incidents { get; set; } = null!;
        public DbSet<AttentionAlert> AttentionAlerts { get; set; } = null!;
        public DbSet<MissingPerson> MissingPersons { get; set; } = null!;
        public DbSet<CollapseReport> CollapseReports { get; set; } = null!;
        public DbSet<MapAnnotation> MapAnnotations { get; set; } = null!;
        public DbSet<DisasterEvent> DisasterEvents { get; set; } = null!;
        public DbSet<SimulationArea> SimulationAreas { get; set; } = null!;
        public DbSet<ScenarioBundle> ScenarioBundles { get; set; } = null!;
        public DbSet<SimulationRun> SimulationRuns { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AttentionAlert>().HasIndex(a => a.ExternalId).IsUnique();
            modelBuilder.Entity<MissingPerson>().HasIndex(m => m.ExternalId).IsUnique();
            modelBuilder.Entity<CollapseReport>().HasIndex(c => c.ExternalId).IsUnique();
            modelBuilder.Entity<MapAnnotation>().HasIndex(m => m.ExternalId).IsUnique();
            modelBuilder.Entity<DisasterEvent>().HasIndex(d => new { d.Provider, d.ProviderEventId }).IsUnique();
            modelBuilder.Entity<Incident>().HasIndex(i => i.Status);
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is TimestampedEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                ((TimestampedEntity)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;

                if (entityEntry.State == EntityState.Added)
                {
                    ((TimestampedEntity)entityEntry.Entity).CreatedAt = DateTime.UtcNow;
                }
            }
        }
    }
}
