using System;

namespace SOSLocation.Infrastructure.Services.Gis
{
    public class GisOptions
    {
        public string OpenTopographyUrl { get; set; } = "https://portal.opentopography.org/API/globaldem";
        public string OverpassUrl { get; set; } = "https://overpass-api.de/api/interpreter";
        public string OpenMeteoUrl { get; set; } = "https://api.open-meteo.com/v1/forecast";
        public int CacheExpirationMinutes { get; set; } = 15;
        public int IndexingIntervalMinutes { get; set; } = 30;
    }
}
