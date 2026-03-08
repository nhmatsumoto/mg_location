using Microsoft.AspNetCore.Mvc;
using SOSLocation.Infrastructure.Persistence;
using SOSLocation.Domain.Entities;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/simulation")]
    public class SimulationController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public SimulationController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet("hotspots")]
        public ActionResult GetHotspots()
        {
            // Placeholder for simulation logic
            return Ok(new[] { new { id = 1, lat = -20.12, lng = -44.12, intensity = 0.8 } });
        }

        [HttpPost("easy")]
        public ActionResult EasySimulation([FromBody] object parameters)
        {
            return Ok(new { status = "success", message = "Simulation started" });
        }
    }
}
