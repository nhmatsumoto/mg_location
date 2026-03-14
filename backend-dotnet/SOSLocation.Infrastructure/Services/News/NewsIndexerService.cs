using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Domain.News;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Infrastructure.Services.News
{
    public class NewsIndexerService : BackgroundService
    {
        private readonly ILogger<NewsIndexerService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private const int IndexIntervalMinutes = 15;

        public NewsIndexerService(
            ILogger<NewsIndexerService> logger, 
            IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting News Indexer Service...");
            
            // Initial seed
            await IndexNewsAsync();

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromMinutes(IndexIntervalMinutes), stoppingToken);
                await IndexNewsAsync();
            }
        }

        private async Task IndexNewsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var dataSourceRepo = scope.ServiceProvider.GetRequiredService<IDataSourceRepository>();
            var newsRepo = scope.ServiceProvider.GetRequiredService<INewsRepository>();
            
            var activeSources = (await dataSourceRepo.GetAllActiveAsync())
                .Where(s => s.Type == "News" || s.Type == "Weather");

            _logger.LogInformation("Processing {count} active data sources...", activeSources.Count());

            foreach (var source in activeSources)
            {
                try
                {
                    _logger.LogInformation("Crawling source: {name} ({url})", source.Name, source.BaseUrl);
                    
                    // Generic crawler logic (Simulation of fetching from actual URL)
                    // In a real scenario, we'd use HttpClient to fetch and parse based on ProviderType
                    var items = await SimulateFetchFromSource(source);

                    foreach (var item in items)
                    {
                        if (!await newsRepo.ExistsAsync(item.Title, item.PublishedAt))
                        {
                            await newsRepo.AddAsync(item);
                            
                            // Broadcast
                            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                            await notificationService.BroadcastAlertAsync(new {
                                item.Id,
                                item.Title,
                                Message = item.Content,
                                Severity = item.RiskScore > 80 ? "critical" : "info",
                                CreatedAt = item.PublishedAt
                            });
                        }
                    }

                    source.LastCrawlAt = DateTime.UtcNow;
                    source.LastErrorMessage = null;
                    await dataSourceRepo.UpdateAsync(source);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to crawl source {name}", source.Name);
                    source.LastErrorMessage = ex.Message;
                    await dataSourceRepo.UpdateAsync(source);
                }
            }
        }

        private async Task<List<NewsNotification>> SimulateFetchFromSource(SOSLocation.Domain.Entities.DataSource source)
        {
            // This is a placeholder for actual multi-provider logic (JsonApi, RSS, etc.)
            await Task.Delay(100); 
            
            // Seed some data if it's the first time
            return new List<NewsNotification>
            {
                new NewsNotification
                {
                    Id = Guid.NewGuid(),
                    Title = $"[{source.Name}] Alerta Detectado: {DateTime.Now:HH:mm}",
                    Content = $"Informação capturada automaticamente da fonte {source.ProviderType}.",
                    Source = source.Name,
                    Country = "Brasil",
                    Location = "Local Genérico",
                    PublishedAt = DateTime.UtcNow,
                    Category = source.Type,
                    RiskScore = new Random().Next(40, 95)
                }
            };
        }
    }
}
