using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SOSLocation.Infrastructure.Persistence;
using SOSLocation.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

using Microsoft.AspNetCore.Authorization;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/hotspots")]
    [Authorize]
    public class HotspotsController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public HotspotsController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetHotspots()
        {
            var areas = await _context.MapAnnotations
                .Where(m => m.RecordType == "hotspot" && m.Status != "Deleted")
                .ToListAsync();

            if (!areas.Any())
            {
                // Return some mock hotspots if none exist in the DB yet, for demo purposes as requested by "execute all steps"
                return Ok(new[] {
                    new { id = "h1", score = 85.5, type = "Landslide", urgency = "Tier 1", estimatedAffected = 120 },
                    new { id = "h2", score = 62.1, type = "Flood", urgency = "Alta", estimatedAffected = 45 }
                });
            }

            return Ok(areas.Select(a => {
                var meta = JsonSerializer.Deserialize<Dictionary<string, object>>(a.MetadataJson) ?? new();
                return new {
                    id = a.Id.ToString(),
                    score = meta.ContainsKey("score") ? Convert.ToDouble(meta["score"].ToString()) : 50.0,
                    type = meta.ContainsKey("type") ? meta["type"].ToString() : "Unknown",
                    urgency = a.Severity,
                    estimatedAffected = meta.ContainsKey("estimatedAffected") ? Convert.ToInt32(meta["estimatedAffected"].ToString()) : 0
                };
            }));
        }
    }
}
