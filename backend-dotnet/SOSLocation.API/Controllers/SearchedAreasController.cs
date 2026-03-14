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
    [Route("api/searched-areas")]
    public class SearchedAreasController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public SearchedAreasController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetSearchedAreas()
        {
            var areas = await _context.MapAnnotations
                .Where(m => m.RecordType == "searched_area" && m.Status != "Deleted")
                .ToListAsync();

            return Ok(areas.Select(a => {
                var meta = JsonSerializer.Deserialize<Dictionary<string, string>>(a.MetadataJson) ?? new();
                return new {
                    id = a.Id,
                    areaName = a.Title,
                    team = meta.GetValueOrDefault("team", "Unknown"),
                    lat = a.Lat,
                    lng = a.Lng,
                    notes = meta.GetValueOrDefault("notes", ""),
                    searchedAtUtc = a.CreatedAt
                };
            }));
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] string areaName, [FromForm] string team, [FromForm] double lat, [FromForm] double lng, [FromForm] string? notes)
        {
            var annotation = new MapAnnotation
            {
                RecordType = "searched_area",
                Title = areaName,
                Lat = lat,
                Lng = lng,
                Status = "Active",
                MetadataJson = JsonSerializer.Serialize(new {
                    team = team,
                    notes = notes ?? ""
                })
            };

            _context.MapAnnotations.Add(annotation);
            await _context.SaveChangesAsync();

            var meta = JsonSerializer.Deserialize<Dictionary<string, string>>(annotation.MetadataJson) ?? new();
            return Ok(new {
                id = annotation.Id,
                areaName = annotation.Title,
                team = meta.GetValueOrDefault("team", "Unknown"),
                lat = annotation.Lat,
                lng = annotation.Lng,
                notes = meta.GetValueOrDefault("notes", ""),
                searchedAtUtc = annotation.CreatedAt
            });
        }
    }
}
