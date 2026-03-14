using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SOSLocation.Infrastructure.Persistence;
using SOSLocation.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/support-points")]
    public class SupportPointsController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public SupportPointsController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetSupportPoints()
        {
            var points = await _context.MapAnnotations
                .Where(m => m.RecordType == "support_point" && m.Status != "Deleted")
                .ToListAsync();

            return Ok(points.Select(p => new {
                id = p.Id,
                recordType = p.RecordType,
                title = p.Title,
                lat = p.Lat,
                lng = p.Lng,
                status = p.Status,
                metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(p.MetadataJson)
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Create(JsonElement payload)
        {
            var annotation = new MapAnnotation
            {
                RecordType = "support_point",
                Title = payload.GetProperty("name").GetString() ?? "",
                Lat = payload.GetProperty("lat").GetDouble(),
                Lng = payload.GetProperty("lng").GetDouble(),
                Status = payload.TryGetProperty("status", out var s) ? s.GetString() ?? "active" : "active",
                MetadataJson = JsonSerializer.Serialize(new {
                    type = payload.TryGetProperty("type", out var t) ? t.GetString() : "Abrigo",
                    capacity = payload.TryGetProperty("capacity", out var c) ? c.GetDouble() : 0
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
            annotation.Lat = payload.GetProperty("lat").GetDouble();
            annotation.Lng = payload.GetProperty("lng").GetDouble();
            annotation.Status = payload.TryGetProperty("status", out var s) ? s.GetString() ?? annotation.Status : annotation.Status;
            
            annotation.MetadataJson = JsonSerializer.Serialize(new {
                type = payload.TryGetProperty("type", out var t) ? t.GetString() : "Abrigo",
                capacity = payload.TryGetProperty("capacity", out var c) ? c.GetDouble() : 0
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
