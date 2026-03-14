using SOSLocation.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Entities
{
    public class UserStats : BaseEntity
    {
        public string KeycloakUserId { get; set; } = string.Empty;
        public int XP { get; set; }
        public int Level { get; set; }
        
        [MaxLength(50)]
        public string RankName { get; set; } = "Novice Responder";
        
        public int TotalReports { get; set; }
        public int ValidatedReports { get; set; }
    }

    public class Badge : BaseEntity
    {
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [MaxLength(255)]
        public string IconUrl { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Category { get; set; } = "General"; // e.g., "Rescue", "Reporting", "Validation"
    }

    public class UserBadge : BaseEntity
    {
        public Guid BadgeId { get; set; }
        public Badge Badge { get; set; } = null!;
        
        public string KeycloakUserId { get; set; } = string.Empty;
        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
    }
}
