using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/v1/terrain")]
    [Authorize]
    public class TerrainController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public TerrainController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpGet("context")]
        public async Task<ActionResult> GetTerrainContext([FromQuery] string bbox)
        {
            // Proxying to the Python GIS backend
            var client = _httpClientFactory.CreateClient();
            var gisUrl = "http://backend-gis:8000/api/context?bbox=" + bbox;

            var response = await client.GetAsync(gisUrl);
            if (!response.IsSuccessStatusCode) return StatusCode((int)response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
    }
}
