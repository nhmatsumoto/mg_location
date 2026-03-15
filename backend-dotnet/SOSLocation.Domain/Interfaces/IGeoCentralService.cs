using SOSLocation.Domain.Entities.Geospatial;

namespace SOSLocation.Domain.Interfaces
{
    public interface IGeoCentralService
    {
        Task<GeoPoint> GetTacticalDataAsync(double latitude, double longitude);
        Task<IEnumerable<GeoPoint>> GetCityScaleDataAsync(double minLat, double minLng, double maxLat, double maxLng);
    }
}
