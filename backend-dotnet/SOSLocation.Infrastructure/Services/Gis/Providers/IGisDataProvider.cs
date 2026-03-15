using System.Threading.Tasks;

namespace SOSLocation.Infrastructure.Services.Gis.Providers
{
    public interface IGisDataProvider
    {
        string ProviderName { get; }
        Task<object> FetchDataAsync(double minLat, double minLon, double maxLat, double maxLon);
        Task<bool> CheckHealthAsync();
    }
}
