using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Infrastructure.Services.Gis.Providers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SOSLocation.Infrastructure.Services.Gis
{
    public class GisService : IGisService
    {
        private readonly IEnumerable<IGisDataProvider> _providers;
        private readonly ILogger<GisService> _logger;
        private readonly IMemoryCache _cache;

        public GisService(IEnumerable<IGisDataProvider> providers, ILogger<GisService> logger, IMemoryCache cache)
        {
            _providers = providers;
            _logger = logger;
            _cache = cache;
        }

        public async Task<List<List<float>>> FetchElevationGridAsync(double minLat, double minLon, double maxLat, double maxLon, int resolution = 128)
        {
            var provider = _providers.OfType<OpenTopographyProvider>().FirstOrDefault();
            if (provider == null) return new List<List<float>>();

            string cacheKey = $"dem_v3_{minLat:F4}_{minLon:F4}_{maxLat:F4}_{maxLon:F4}_{resolution}";
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
                var data = await provider.FetchDataAsync(minLat, minLon, maxLat, maxLon);
                return data as List<List<float>> ?? new List<List<float>>();
            }) ?? new List<List<float>>();
        }

        public async Task<object> FetchUrbanFeaturesAsync(double minLat, double minLon, double maxLat, double maxLon)
        {
            var provider = _providers.OfType<OverpassProvider>().FirstOrDefault();
            if (provider == null) return new { buildings = new List<object>() };

            string cacheKey = $"urban_v3_{minLat:F4}_{minLon:F4}_{maxLat:F4}_{maxLon:F4}";
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
                return await provider.FetchDataAsync(minLat, minLon, maxLat, maxLon);
            }) ?? new { buildings = new List<object>() };
        }

        public async Task<object> FetchSoilDataAsync(double minLat, double minLon, double maxLat, double maxLon)
        {
            string cacheKey = $"soil_v3_{minLat:F4}_{minLon:F4}_{maxLat:F4}_{maxLon:F4}";
            var cached = await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(60);
                var rnd = new Random(cacheKey.GetHashCode());
                return (object)new
                {
                    type = "Clay Loam",
                    saturation = rnd.Next(20, 80),
                    permeability = rnd.NextDouble() * 5.0
                };
            });
            return cached ?? new { type = "Unknown" };
        }

        public async Task<object> FetchVegetationDataAsync(double minLat, double minLon, double maxLat, double maxLon)
        {
            string cacheKey = $"veg_v3_{minLat:F4}_{minLon:F4}_{maxLat:F4}_{maxLon:F4}";
            var cached = await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(60);
                var rnd = new Random(cacheKey.GetHashCode());
                return (object)new
                {
                    ndvi_mean = 0.4 + (rnd.NextDouble() * 0.4),
                    density = "Moderate"
                };
            });
            return cached ?? new { density = "Unknown" };
        }

        public async Task<object> FetchClimateDataAsync(double minLat, double minLon, double maxLat, double maxLon)
        {
            var provider = _providers.OfType<OpenMeteoProvider>().FirstOrDefault();
            if (provider == null) return new { temperature = 25.0 };

            string cacheKey = $"climate_v3_{minLat:F4}_{minLon:F4}_{maxLat:F4}_{maxLon:F4}";
            var cached = await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);
                return await provider.FetchDataAsync(minLat, minLon, maxLat, maxLon);
            });
            return cached ?? new { temperature = 25.0 };
        }
    }
}
