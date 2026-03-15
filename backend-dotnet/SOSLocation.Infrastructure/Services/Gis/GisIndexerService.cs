using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SOSLocation.Domain.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Infrastructure.Services.Gis
{
    public class GisIndexerService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<GisIndexerService> _logger;
        private readonly GisOptions _options;

        public GisIndexerService(IServiceProvider serviceProvider, ILogger<GisIndexerService> logger, IOptions<GisOptions> options)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("GisIndexerService is starting. Interval: {min}min", _options.IndexingIntervalMinutes);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await IndexActiveRegionsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during GIS indexing cycle.");
                }

                await Task.Delay(TimeSpan.FromMinutes(_options.IndexingIntervalMinutes), stoppingToken);
            }
        }

        private async Task IndexActiveRegionsAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var gisService = scope.ServiceProvider.GetRequiredService<IGisService>();
            var incidentRepo = scope.ServiceProvider.GetRequiredService<IIncidentRepository>();
            
            _logger.LogInformation("GisIndexerService: Scanning for active incidents to index...");

            // Fetch active incidents (simulating logic to get active regions)
            var activeIncidents = await incidentRepo.GetAllAsync(); 
            var recentIncidents = activeIncidents.Where(i => i.CreatedAt > DateTime.UtcNow.AddDays(-7)).ToList();

            foreach (var incident in recentIncidents)
            {
                if (ct.IsCancellationRequested) break;

                _logger.LogDebug("Indexing GIS/Climate for Incident {id} at {lat},{lng}", incident.Id, incident.Lat, incident.Lon);

                double offset = 0.005;
                double minLat = incident.Lat - offset;
                double maxLat = incident.Lat + offset;
                double minLon = incident.Lon - offset;
                double maxLon = incident.Lon + offset;

                await Task.WhenAll(
                    gisService.FetchElevationGridAsync(minLat, minLon, maxLat, maxLon, 64),
                    gisService.FetchUrbanFeaturesAsync(minLat, minLon, maxLat, maxLon),
                    gisService.FetchClimateDataAsync(minLat, minLon, maxLat, maxLon)
                );
            }

            _logger.LogInformation("GisIndexerService: Completed indexing cycle for {count} incidents.", recentIncidents.Count);
        }
    }
}
