using SOSLocation.Domain.Shared;
using SOSLocation.Domain.Incidents;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Missions
{
    public class Assignment : BaseEntity
    {
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }

        public Guid? ExternalId { get; set; }

        public Guid SearchAreaId { get; set; }
        public SearchArea? SearchArea { get; set; }

        [MaxLength(128)]
        public string AssignedToUserId { get; set; } = string.Empty;

        [MaxLength(128)]
        public string AssignedToTeamId { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Status { get; set; } = "Assigned";

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}
