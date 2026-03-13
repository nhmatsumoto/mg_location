using Microsoft.AspNetCore.SignalR;
using SOSLocation.Domain.News;
using System.Threading.Tasks;

namespace SOSLocation.API.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Global");
            await base.OnConnectedAsync();
        }

        public async Task SubscribeToLocation(string country, string location)
        {
            string groupName = GetLocationGroupName(country, location);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task UnsubscribeFromLocation(string country, string location)
        {
            string groupName = GetLocationGroupName(country, location);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        private static string GetLocationGroupName(string country, string location) => 
            $"Location_{country.ToLower()}_{location.ToLower()}".Replace(" ", "_");
    }
}
