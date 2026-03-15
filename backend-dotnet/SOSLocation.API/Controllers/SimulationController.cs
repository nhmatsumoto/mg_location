using Microsoft.AspNetCore.Mvc;
using SOSLocation.Infrastructure.Persistence;
using SOSLocation.Domain.Common;
using SOSLocation.Application.DTOs.Common;
using SOSLocation.Application.DTOs.Simulation;
using System.Collections.Generic;

using Microsoft.AspNetCore.Authorization;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/simulation")]
    [Authorize]
    public class SimulationController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public SimulationController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet("hotspots")]
        public ActionResult<Result<List<HotspotDto>>> GetHotspots()
        {
            // Placeholder for simulation logic
            var hotspots = new List<HotspotDto> 
            { 
                new HotspotDto { Id = 1, Lat = -20.12, Lng = -44.12, Intensity = 0.8 } 
            };
            return Ok(Result<List<HotspotDto>>.Success(hotspots));
        }

        [HttpPost("easy")]
        public ActionResult<Result<ActionResponseDto>> EasySimulation([FromBody] object parameters)
        {
            return Ok(Result<ActionResponseDto>.Success(new ActionResponseDto 
            { 
                Success = true, 
                Message = "Simulation started" 
            }));
        }
    }
}
