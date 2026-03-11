using SOSLocation.Domain.Shared;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Missions
{
    public class RescueTask : BaseEntity
    {
        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public Guid? ExternalId { get; set; }

        [MaxLength(140)]
        public string Team { get; set; } = string.Empty;

        [MaxLength(180)]
        public string Location { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [MaxLength(10)]
        public string Priority { get; set; } = "media";

        [MaxLength(10)]
        public string Status { get; set; } = "aberto";
    }
}
