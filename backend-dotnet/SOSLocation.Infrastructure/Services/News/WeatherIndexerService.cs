using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SOSLocation.Domain.Entities;
using SOSLocation.Infrastructure.Persistence;
using SOSLocation.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Infrastructure.Services.News
{
    public class WeatherIndexerService : BackgroundService
    {
        private readonly ILogger<WeatherIndexerService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly INotificationService _notificationService;
        private const int IndexIntervalMinutes = 20;

        public WeatherIndexerService(ILogger<WeatherIndexerService> logger, IServiceProvider serviceProvider, INotificationService notificationService)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _notificationService = notificationService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting Weather Indexer Service...");
            
            await IndexWeatherAsync();

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromMinutes(IndexIntervalMinutes), stoppingToken);
                await IndexWeatherAsync();
            }
        }

        private async Task IndexWeatherAsync()
        {
            _logger.LogInformation("Indexing weather data from climatic agencies...");

            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<SOSLocationDbContext>();

            // Simulate capturing real meteorological data
            var weatherRecords = new List<MeteorologicalData>
            {
                new MeteorologicalData
                {
                    LocationName = "Tokyo",
                    Latitude = 35.6895,
                    Longitude = 139.6917,
                    Temperature = 18.5,
                    Humidity = 65,
                    WindSpeed = 12.0,
                    Condition = "Rainy",
                    CapturedAt = DateTime.UtcNow,
                    rawDataJson = "{\"precip\": \"45mm/h\", \"source\": \"JMA API\"}"
                },
                new MeteorologicalData
                {
                    LocationName = "São Paulo",
                    Latitude = -23.5505,
                    Longitude = -46.6333,
                    Temperature = 32.0,
                    Humidity = 30,
                    WindSpeed = 5.5,
                    Condition = "Sunny",
                    CapturedAt = DateTime.UtcNow.AddHours(-1),
                    rawDataJson = "{\"heatwave\": true, \"source\": \"INMET API\"}"
                }
            };

            try
            {
                context.MeteorologicalData.AddRange(weatherRecords);
                await context.SaveChangesAsync();
                _logger.LogInformation("Successfully indexed {count} meteorological data points.", weatherRecords.Count);

                // BROADCAST
                foreach (var weather in weatherRecords)
                {
                    await _notificationService.BroadcastAlertAsync(new {
                        Type = "METEOROLOGICAL",
                        weather.LocationName,
                        weather.Temperature,
                        weather.Condition,
                        weather.CapturedAt
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to persist meteorological data.");
            }
        }
    }
}
