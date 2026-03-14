using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Incidents;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Common;
using SOSLocation.Application.DTOs.Common;
using SOSLocation.Application.DTOs.Disasters;
using SOSLocation.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.OutputCaching;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/disasters")]
    public class DisastersController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public DisastersController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet("events")]
        [OutputCache(PolicyName = "Cache1Min")]
        public ActionResult<Result<ListResponseDto<DisasterEvent>>> GetEvents([FromQuery] string? bbox, [FromQuery] string? types)
        {
            var query = _context.DisasterEvents.AsQueryable();

            if (!string.IsNullOrEmpty(types))
            {
                var typesList = types.Split(',');
                query = query.Where(e => typesList.Contains(e.EventType));
            }

            var events = query.OrderByDescending(e => e.StartAt).Take(100).ToList();
            
            return Ok(Result<ListResponseDto<DisasterEvent>>.Success(new ListResponseDto<DisasterEvent> 
            { 
                Items = events,
                TotalCount = events.Count
            }));
        }

        [HttpGet("stats/by-country")]
        [OutputCache(PolicyName = "Cache5Min")]
        public ActionResult<Result<ListResponseDto<DisasterStatsDto>>> GetStatsByCountry()
        {
            var stats = _context.DisasterEvents
                .GroupBy(e => new { e.CountryCode, e.CountryName })
                .Select(g => new DisasterStatsDto 
                { 
                    CountryCode = g.Key.CountryCode, 
                    CountryName = g.Key.CountryName, 
                    Count = g.Count(), 
                    MaxSeverity = g.Max(e => e.Severity).ToString() 
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            return Ok(Result<ListResponseDto<DisasterStatsDto>>.Success(new ListResponseDto<DisasterStatsDto>
            {
                Items = stats,
                TotalCount = stats.Count
            }));
        }

        [HttpPost("crawl")]
        public ActionResult<Result<ActionResponseDto>> TriggerCrawl()
        {
            return Ok(Result<ActionResponseDto>.Success(new ActionResponseDto 
            { 
                Success = true, 
                Message = "Simulation: Crawl triggered." 
            }));
        }
    }
}
