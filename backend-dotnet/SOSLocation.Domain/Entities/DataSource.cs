using SOSLocation.Domain.Shared;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Domain.Entities
{
    public class DataSource : BaseEntity
    {
        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(40)]
        public string Type { get; set; } = string.Empty; // News, Weather, People, Risk

        [Required]
        [MaxLength(40)]
        public string ProviderType { get; set; } = string.Empty; // JsonApi, RSS, Scraper, Inmet, Cemaden

        [Required]
        [MaxLength(500)]
        public string BaseUrl { get; set; } = string.Empty;

        public int FrequencyMinutes { get; set; } = 30;

        public bool IsActive { get; set; } = true;

        public string? MetadataJson { get; set; }

        public DateTime? LastCrawlAt { get; set; }
        
        [MaxLength(500)]
        public string? LastErrorMessage { get; set; }
    }
}
