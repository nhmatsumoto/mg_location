using SOSLocation.Domain.Shared;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Missions
{
    public class RescueGroup : BaseEntity
    {
        [MaxLength(24)]
        public string ExternalId { get; set; } = string.Empty;

        [MaxLength(160)]
        public string Name { get; set; } = string.Empty;

        public int Members { get; set; }

        [MaxLength(120)]
        public string Specialty { get; set; } = "generalista";

        [MaxLength(30)]
        public string Status { get; set; } = "pronto";

        public double? Lat { get; set; }
        public double? Lng { get; set; }
    }
}
