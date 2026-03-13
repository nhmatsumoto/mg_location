using SOSLocation.Domain.Shared;
using SOSLocation.Domain.Incidents;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Shared
{
    public class DonationMoney : BaseEntity
    {
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }

        public Guid? ExternalId { get; set; }

        public Guid? CampaignId { get; set; }
        public Campaign? Campaign { get; set; }

        public double Amount { get; set; }

        [MaxLength(40)]
        public string DonorName { get; set; } = "Anonymous";

        [MaxLength(20)]
        public string Status { get; set; } = "Pending";
    }
}
