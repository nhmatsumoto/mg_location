using SOSLocation.Domain.Shared;
using SOSLocation.Domain.Incidents;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Shared
{
    public class Campaign : BaseEntity
    {
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }

        public Guid? ExternalId { get; set; }

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public double GoalAmount { get; set; }
        public double CurrentAmount { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";
    }
}
