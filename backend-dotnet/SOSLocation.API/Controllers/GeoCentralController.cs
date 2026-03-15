using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Interfaces;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class GeoCentralController : ControllerBase
    {
        private readonly IGeoCentralService _geoCentralService;

        public GeoCentralController(IGeoCentralService geoCentralService)
        {
            _geoCentralService = geoCentralService;
        }

        [HttpGet("tactical")]
        public async Task<IActionResult> GetTacticalData([FromQuery] double lat, [FromQuery] double lng)
        {
            var data = await _geoCentralService.GetTacticalDataAsync(lat, lng);
            return Ok(data);
        }

        [HttpGet("city-scale")]
        public async Task<IActionResult> GetCityScaleData([FromQuery] double minLat, [FromQuery] double minLng, [FromQuery] double maxLat, [FromQuery] double maxLng)
        {
            var data = await _geoCentralService.GetCityScaleDataAsync(minLat, minLng, maxLat, maxLng);
            return Ok(data);
        }
    }
}
