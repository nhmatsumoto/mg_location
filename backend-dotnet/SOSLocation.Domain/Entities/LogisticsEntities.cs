using SOSLocation.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Entities
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

    public class SupplyLogistics : BaseEntity
    {
        [MaxLength(24)]
        public string ExternalId { get; set; } = string.Empty;

        [MaxLength(140)]
        public string Item { get; set; } = string.Empty;

        public int Quantity { get; set; }

        [MaxLength(40)]
        public string Unit { get; set; } = "un";

        [MaxLength(160)]
        public string Origin { get; set; } = string.Empty;

        [MaxLength(160)]
        public string Destination { get; set; } = string.Empty;

        [MaxLength(30)]
        public string Status { get; set; } = "planejado";

        [MaxLength(20)]
        public string Priority { get; set; } = "media";
    }
}
