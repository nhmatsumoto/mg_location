using SOSLocation.Domain.Shared;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Shared
{
    public class SimulationArea : BaseEntity
    {
        [MaxLength(255)]
        public string Name { get; set; } = "New Simulation Area";

        public double BboxMinLat { get; set; }
        public double BboxMinLng { get; set; }
        public double BboxMaxLat { get; set; }
        public double BboxMaxLng { get; set; }

        public string PolygonGeometryJson { get; set; } = "{}";
    }
}
