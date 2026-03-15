using SOSLocation.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Entities
{
    public class RiskAnalysis : BaseEntity
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        
        [MaxLength(100)]
        public string LocationName { get; set; } = string.Empty;

        public double Score { get; set; } // 0-100
        
        [MaxLength(20)]
        public string Level { get; set; } = "Low"; // Low, Medium, High, Critical
        
        public string FactorsJson { get; set; } = "{}";
        
        public DateTime AnalysisDate { get; set; } = DateTime.UtcNow;
        
        public Guid? RelatedIncidentId { get; set; }
    }
}
