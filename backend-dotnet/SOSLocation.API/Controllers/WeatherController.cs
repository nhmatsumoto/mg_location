using Microsoft.AspNetCore.Mvc;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/weather")]
    public class WeatherController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public WeatherController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<ActionResult> GetNowcast([FromQuery] double lat, [FromQuery] double lon)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true";

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return StatusCode((int)response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
    }
}
