namespace SOSLocation.Application.DTOs.Disasters
{
    public class DisasterStatsDto
    {
        public string CountryCode { get; set; } = string.Empty;
        public string CountryName { get; set; } = string.Empty;
        public int Count { get; set; }
        public string MaxSeverity { get; set; } = string.Empty;
    }
}
