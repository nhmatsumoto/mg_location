using SOSLocation.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Entities
{
    public class MeteorologicalData : BaseEntity
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        
        [MaxLength(100)]
        public string LocationName { get; set; } = string.Empty;

        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double WindSpeed { get; set; }
        
        [MaxLength(50)]
        public string Condition { get; set; } = string.Empty; // e.g., Sunny, Rainy, Storm
        
        public string rawDataJson { get; set; } = "{}";
        
        public DateTime CapturedAt { get; set; } = DateTime.UtcNow;
    }
}
