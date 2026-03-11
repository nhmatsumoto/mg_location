using SOSLocation.Domain.Shared;
using SOSLocation.Domain.Incidents;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Tracking
{
    public class PublicSnapshot : BaseEntity
    {
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public string DataJson { get; set; } = "{}";

        [MaxLength(20)]
        public string Version { get; set; } = "v1";
    }
}
