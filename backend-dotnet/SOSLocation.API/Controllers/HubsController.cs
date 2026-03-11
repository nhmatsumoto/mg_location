using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Tracking;
using SOSLocation.Domain.Interfaces;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/hubs")]
    public class HubsController : ControllerBase
    {
        private readonly IHubRepository _repository;

        public HubsController(IHubRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _repository.GetAllAsync());
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] EdgeHub hub)
        {
            await _repository.AddAsync(hub);
            return Ok(new { status = "registered" });
        }
    }
}
