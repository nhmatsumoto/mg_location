using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace SOSLocation.Infrastructure.Services.Gis.Providers
{
    public class OpenMeteoProvider : IGisDataProvider
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<OpenMeteoProvider> _logger;
        private readonly GisOptions _options;

        public string ProviderName => "OpenMeteo";

        public OpenMeteoProvider(HttpClient httpClient, ILogger<OpenMeteoProvider> logger, IOptions<GisOptions> options)
        {
            _httpClient = httpClient;
            _logger = logger;
            _options = options.Value;
        }

        public async Task<object> FetchDataAsync(double minLat, double minLon, double maxLat, double maxLon)
        {
            // Open-Meteo usually takes a single point, but we can average or take center for a bbox
            double centerLat = (minLat + maxLat) / 2.0;
            double centerLon = (minLon + maxLon) / 2.0;

            var queryUrl = $"{_options.OpenMeteoUrl}?latitude={centerLat:F4}&longitude={centerLon:F4}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m";

            try
            {
                _logger.LogInformation("Fetching Climate Data from Open-Meteo: {lat},{lon}", centerLat, centerLon);
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                var response = await _httpClient.GetAsync(queryUrl, cts.Token);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    return JsonDocument.Parse(json);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Open-Meteo query failed: {msg}", ex.Message);
            }

            return new { temperature = 25.0, humidity = 60, precipitation = 0.0, wind_speed = 10.0 };
        }

        public async Task<bool> CheckHealthAsync()
        {
            try
            {
                // Simple connectivity check
                var response = await _httpClient.GetAsync("https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
