using Microsoft.AspNetCore.SignalR;
using SOSLocation.API.Hubs;
using SOSLocation.Domain.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task BroadcastAlertAsync(object alert, CancellationToken ct = default)
        {
            await _hubContext.Clients.Group("Global").SendAsync("ReceiveAlert", alert, ct);
        }

        public async Task BroadcastRiskUpdateAsync(object risk, CancellationToken ct = default)
        {
            await _hubContext.Clients.Group("Global").SendAsync("UpdateRisk", risk, ct);
        }

        public async Task BroadcastWeatherUpdateAsync(object weather, string? location = null, string? country = null, CancellationToken ct = default)
        {
            if (!string.IsNullOrEmpty(location) && !string.IsNullOrEmpty(country))
            {
                string groupName = $"Location_{country.ToLower()}_{location.ToLower()}".Replace(" ", "_");
                await _hubContext.Clients.Group(groupName).SendAsync("UpdateWeather", weather, ct);
            }
            await _hubContext.Clients.Group("Global").SendAsync("UpdateWeather", weather, ct);
        }
    }
}
