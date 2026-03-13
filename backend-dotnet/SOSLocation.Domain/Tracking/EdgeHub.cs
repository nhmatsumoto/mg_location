using SOSLocation.Domain.Shared;
using SOSLocation.Domain.Incidents;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Tracking
{
    public class EdgeHub : BaseEntity
    {
        [MaxLength(64)]
        public string HubId { get; set; } = string.Empty;

        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(45)]
        public string LocalIp { get; set; } = string.Empty;

        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

        [MaxLength(40)]
        public string Status { get; set; } = "online";

        public Guid? IncidentId { get; set; }
        public Incident? Incident { get; set; }
    }
}
