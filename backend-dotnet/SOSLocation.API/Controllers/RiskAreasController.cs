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
    [Route("api/risk-areas")]
    [Authorize]
    public class RiskAreasController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public RiskAreasController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRiskAreas()
        {
            var areas = await _context.MapAnnotations
                .Where(m => m.RecordType == "risk_area" && m.Status != "Deleted")
                .ToListAsync();

            return Ok(areas.Select(a => new {
                id = a.Id,
                recordType = a.RecordType,
                title = a.Title,
                severity = a.Severity,
                lat = a.Lat,
                lng = a.Lng,
                radiusMeters = a.RadiusMeters,
                status = a.Status,
                metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(a.MetadataJson)
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Create(JsonElement payload)
        {
            var annotation = new MapAnnotation
            {
                RecordType = "risk_area",
                Title = payload.GetProperty("name").GetString() ?? "",
                Severity = payload.TryGetProperty("severity", out var sev) ? sev.GetString() ?? "High" : "High",
                Lat = payload.GetProperty("lat").GetDouble(),
                Lng = payload.GetProperty("lng").GetDouble(),
                RadiusMeters = payload.TryGetProperty("radiusMeters", out var r) ? r.GetInt32() : 350,
                Status = payload.TryGetProperty("status", out var s) ? s.GetString() ?? "active" : "active",
                MetadataJson = JsonSerializer.Serialize(new {
                    notes = payload.TryGetProperty("notes", out var n) ? n.GetString() : ""
                })
            };

            _context.MapAnnotations.Add(annotation);
            await _context.SaveChangesAsync();
            return Ok(annotation);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromQuery] Guid id, JsonElement payload)
        {
            var annotation = await _context.MapAnnotations.FindAsync(id);
            if (annotation == null) return NotFound();

            annotation.Title = payload.GetProperty("name").GetString() ?? annotation.Title;
            annotation.Severity = payload.TryGetProperty("severity", out var sev) ? sev.GetString() ?? annotation.Severity : annotation.Severity;
            annotation.Lat = payload.GetProperty("lat").GetDouble();
            annotation.Lng = payload.GetProperty("lng").GetDouble();
            annotation.RadiusMeters = payload.TryGetProperty("radiusMeters", out var r) ? r.GetInt32() : annotation.RadiusMeters;
            annotation.Status = payload.TryGetProperty("status", out var s) ? s.GetString() ?? annotation.Status : annotation.Status;
            
            annotation.MetadataJson = JsonSerializer.Serialize(new {
                notes = payload.TryGetProperty("notes", out var n) ? n.GetString() : ""
            });

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] Guid id)
        {
            var annotation = await _context.MapAnnotations.FindAsync(id);
            if (annotation == null) return NotFound();

            annotation.Status = "Deleted";
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
