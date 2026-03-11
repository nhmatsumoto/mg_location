using SOSLocation.Domain.Shared;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Incidents
{
    public class DisasterEvent : BaseEntity
    {
        [MaxLength(40)]
        public string Provider { get; set; } = "MANUAL";

        [MaxLength(100)]
        public string ProviderEventId { get; set; } = string.Empty;

        [MaxLength(60)]
        public string EventType { get; set; } = "Other";

        public int Severity { get; set; } = 1;

        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        public DateTime StartAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndAt { get; set; }

        public float Lat { get; set; }
        public float Lon { get; set; }

        [MaxLength(2)]
        public string CountryCode { get; set; } = string.Empty;

        [MaxLength(120)]
        public string CountryName { get; set; } = string.Empty;

        public string SourceUrl { get; set; } = string.Empty;
    }
}
