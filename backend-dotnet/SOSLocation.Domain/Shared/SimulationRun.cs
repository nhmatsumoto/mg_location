using SOSLocation.Domain.Shared;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Shared
{
    public class SimulationRun : BaseEntity
    {
        public Guid ScenarioId { get; set; }
        public ScenarioBundle? Scenario { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "pending";

        public double WaterLevelStart { get; set; } = 0.0;
        public double RainfallMm { get; set; } = 50.0;
        public double DurationHours { get; set; } = 24.0;

        public string MetricsJson { get; set; } = "{}";
        public string ArtifactsJson { get; set; } = "{}";
    }
}
