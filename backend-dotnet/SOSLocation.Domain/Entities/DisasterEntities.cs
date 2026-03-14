using SOSLocation.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Entities
{
    public class DisasterEvent : BaseEntity
    {
        [MaxLength(40)]
        public string Provider { get; set; } = "MANUAL";

        [MaxLength(100)]
        public string ProviderEventId { get; set; } = string.Empty;

        [MaxLength(60)]
        public string EventType { get; set; } = "Other";
        
        public Guid? DisasterTypeId { get; set; }
        public DisasterType? DisasterType { get; set; }

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
    public class DisasterType : BaseEntity
    {
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Icon { get; set; } = string.Empty;

        [MaxLength(7)]
        public string Color { get; set; } = "#FF0000";
    }
}
