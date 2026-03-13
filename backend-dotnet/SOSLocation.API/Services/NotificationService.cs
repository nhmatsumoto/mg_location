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
    }
}
