using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SOSLocation.Domain.Interfaces;
using System.Text.Json;

namespace SOSLocation.Infrastructure.Services.Gis
{
    public class AlertsBackgroundService : BackgroundService, IAlertsService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AlertsBackgroundService> _logger;
        private readonly List<object> _activeAlerts = new();
        private readonly string _inmetUrl;
        private const int PollIntervalMinutes = 60;

        public AlertsBackgroundService(HttpClient httpClient, ILogger<AlertsBackgroundService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _inmetUrl = configuration["ExternalIntegrations:InmetUrl"] ?? "https://apiprevmet3.inmet.gov.br/avisos/ativos";
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting Alerts Polling Service...");
            while (!stoppingToken.IsCancellationRequested)
            {
                await PollAlertsAsync();
                await Task.Delay(TimeSpan.FromMinutes(PollIntervalMinutes), stoppingToken);
            }
        }

        public async Task PollAlertsAsync()
        {
            _logger.LogInformation("Polling INMET for active disaster alerts...");
            try
            {
                var response = await _httpClient.GetAsync(_inmetUrl);
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                var alerts = new List<object>();

                // Parse "hoje" and "futuro" sections
                if (root.TryGetProperty("hoje", out var hoje))
                {
                    alerts.AddRange(ParseInmetSection(hoje));
                }
                if (root.TryGetProperty("futuro", out var futuro))
                {
                    alerts.AddRange(ParseInmetSection(futuro));
                }

                lock (_activeAlerts)
                {
                    _activeAlerts.Clear();
                    _activeAlerts.AddRange(alerts);
                }

                _logger.LogInformation("Fetched {count} alerts from INMET", alerts.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch INMET alerts");
            }
        }

        private List<object> ParseInmetSection(JsonElement section)
        {
            var result = new List<object>();
            if (section.ValueKind != JsonValueKind.Array) return result;

            foreach (var item in section.EnumerateArray())
            {
                try
                {
                    // Map INMET fields to our internal format
                    // INMET usually returns: id, aviso_id, titulo, descricao, cor, geocode, etc.
                    result.Add(new
                    {
                        id = item.TryGetProperty("aviso_id", out var id) ? id.GetString() : Guid.NewGuid().ToString(),
                        title = item.TryGetProperty("titulo", out var t) ? t.GetString() : "Alerta de Risco",
                        severity = item.TryGetProperty("cor", out var c) ? c.GetString() : "Atenção",
                        description = item.TryGetProperty("descricao", out var d) ? d.GetString() : "",
                        source = "INMET",
                        // Note: Real INMET alerts might have geocode or specific polygons
                        // If they don't have lat/lon in this specific endpoint, we might need another join
                        // For now, we ensure the structure exists.
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse individual alert item");
                }
            }
            return result;
        }

        public IEnumerable<object> GetActiveAlerts()
        {
            lock (_activeAlerts)
            {
                return _activeAlerts.ToList();
            }
        }
    }
}
