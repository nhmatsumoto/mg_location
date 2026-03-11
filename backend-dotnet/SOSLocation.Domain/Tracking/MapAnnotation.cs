using SOSLocation.Domain.Shared;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Tracking
{
    public class MapAnnotation : BaseEntity
    {
        [MaxLength(24)]
        public string ExternalId { get; set; } = string.Empty;

        [MaxLength(20)]
        public string RecordType { get; set; } = string.Empty;

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public double Lat { get; set; }
        public double Lng { get; set; }

        [MaxLength(20)]
        public string Severity { get; set; } = "Low";

        public int? RadiusMeters { get; set; }

        [MaxLength(30)]
        public string Status { get; set; } = "Active";

        public string MetadataJson { get; set; } = "{}";
    }
}
