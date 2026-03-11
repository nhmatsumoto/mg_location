using SOSLocation.Domain.Shared;
using SOSLocation.Domain.Incidents;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Missions
{
    public class SearchArea : BaseEntity
    {
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }

        public Guid? ExternalId { get; set; }

        [MaxLength(180)]
        public string Name { get; set; } = string.Empty;

        public string GeometryJson { get; set; } = "{}";

        [MaxLength(20)]
        public string Status { get; set; } = "Pending";
    }
}
