using SOSLocation.Domain.Shared;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Shared
{
    public class ScenarioBundle : BaseEntity
    {
        public Guid AreaId { get; set; }
        public SimulationArea? Area { get; set; }

        [MaxLength(50)]
        public string Version { get; set; } = "v1.0";

        [MaxLength(20)]
        public string Status { get; set; } = "pending";

        [MaxLength(512)]
        public string TerrainPath { get; set; } = string.Empty;

        [MaxLength(512)]
        public string BuildingsPath { get; set; } = string.Empty;

        public string ParametersJson { get; set; } = "{}";
    }
}
