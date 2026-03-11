using SOSLocation.Domain.Shared;
using SOSLocation.Domain.Incidents;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Shared
{
    public class Expense : BaseEntity
    {
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }

        public Guid? ExternalId { get; set; }

        [MaxLength(180)]
        public string Description { get; set; } = string.Empty;

        public double Amount { get; set; }

        [MaxLength(40)]
        public string Category { get; set; } = "General";
    }
}
