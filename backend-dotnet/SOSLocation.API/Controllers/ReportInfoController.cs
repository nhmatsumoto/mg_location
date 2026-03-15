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
    [Route("api/report-info")]
    [Authorize]
    public class ReportInfoController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public ReportInfoController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetReports()
        {
            var reports = await _context.MapAnnotations
                .Where(m => m.RecordType == "report" && m.Status != "Deleted")
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(reports.Select(r => {
                var meta = JsonSerializer.Deserialize<Dictionary<string, string>>(r.MetadataJson) ?? new();
                return new {
                    id = r.Id,
                    kind = meta.GetValueOrDefault("kind", "person"),
                    name = r.Title,
                    lastSeen = meta.GetValueOrDefault("lastSeen", ""),
                    details = meta.GetValueOrDefault("details", ""),
                    contact = meta.GetValueOrDefault("contact", ""),
                    reportedAtUtc = r.CreatedAt
                };
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Create(JsonElement payload)
        {
            var annotation = new MapAnnotation
            {
                RecordType = "report",
                Title = payload.GetProperty("name").GetString() ?? "Sem nome",
                Lat = 0, // Posicionalmente nulo para relatos de texto simples
                Lng = 0,
                Status = "Active",
                MetadataJson = JsonSerializer.Serialize(new {
                    kind = payload.GetProperty("kind").GetString() ?? "person",
                    lastSeen = payload.GetProperty("lastSeen").GetString() ?? "",
                    details = payload.GetProperty("details").GetString() ?? "",
                    contact = payload.GetProperty("contact").GetString() ?? ""
                })
            };

            _context.MapAnnotations.Add(annotation);
            await _context.SaveChangesAsync();

            var meta = JsonSerializer.Deserialize<Dictionary<string, string>>(annotation.MetadataJson) ?? new();
            return Ok(new {
                id = annotation.Id,
                kind = meta.GetValueOrDefault("kind", "person"),
                name = annotation.Title,
                lastSeen = meta.GetValueOrDefault("lastSeen", ""),
                details = meta.GetValueOrDefault("details", ""),
                contact = meta.GetValueOrDefault("contact", ""),
                reportedAtUtc = annotation.CreatedAt
            });
        }
    }
}
