using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/hubs")]
    [Authorize]
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
