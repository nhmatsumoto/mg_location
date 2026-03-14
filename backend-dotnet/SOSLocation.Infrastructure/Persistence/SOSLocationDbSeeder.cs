using SOSLocation.Domain.Entities;
using System.Collections.Generic;
using System.Linq;

namespace SOSLocation.Infrastructure.Persistence
{
    public static class SOSLocationDbSeeder
    {
        public static void Seed(SOSLocationDbContext context)
        {
            if (!context.DisasterTypes.Any())
            {
                context.DisasterTypes.AddRange(new List<DisasterType>
                {
                    new DisasterType { Name = "Flood", Code = "FLOOD", Description = "Flooding events", Icon = "flood", Color = "#0000FF" },
                    new DisasterType { Name = "Earthquake", Code = "EARTHQUAKE", Description = "Seismic events", Icon = "landscape", Color = "#8B4513" },
                    new DisasterType { Name = "Landslide", Code = "LANDSLIDE", Description = "Landslide and slope failure", Icon = "terrain", Color = "#654321" },
                    new DisasterType { Name = "Storm", Code = "STORM", Description = "Severe weather and storms", Icon = "thunderstorm", Color = "#808080" },
                    new DisasterType { Name = "Wildfire", Code = "FIRE", Description = "Fire and smoke events", Icon = "local_fire_department", Color = "#FF4500" },
                    new DisasterType { Name = "Other", Code = "OTHER", Description = "General disaster events", Icon = "warning", Color = "#FFD700" }
                });
                context.SaveChanges();
            }
        }
    }
}
