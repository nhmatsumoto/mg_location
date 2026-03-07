using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/disasters")]
    public class DisastersController : ControllerBase
    {
        private readonly SOSLocation.Infrastructure.Persistence.SOSLocationDbContext _context;

        public DisastersController(SOSLocation.Infrastructure.Persistence.SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet("events")]
        public IActionResult GetEvents([FromQuery] string? bbox, [FromQuery] string? types)
        {
            var query = _context.DisasterEvents.AsQueryable();

            if (!string.IsNullOrEmpty(types))
            {
                var typesList = types.Split(',');
                query = query.Where(e => typesList.Contains(e.EventType));
            }

            // Simplified mapping
            return Ok(new { items = query.OrderByDescending(e => e.StartAt).Take(100).ToList() });
        }

        [HttpGet("stats/by-country")]
        public IActionResult GetStatsByCountry()
        {
            var stats = _context.DisasterEvents
                .GroupBy(e => new { e.CountryCode, e.CountryName })
                .Select(g => new { CountryCode = g.Key.CountryCode, CountryName = g.Key.CountryName, Count = g.Count(), MaxSeverity = g.Max(e => e.Severity) })
                .OrderByDescending(x => x.Count)
                .ToList();

            return Ok(new { items = stats });
        }

        [HttpPost("crawl")]
        public IActionResult TriggerCrawl()
        {
            return Ok(new { ok = true, message = "Simulation: Crawl triggered." });
        }
    }
}
