using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SOSLocation.Application.Features.Logistics.Commands.CreateSupply;
using SOSLocation.Domain.Interfaces;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LogisticsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ISupplyLogisticsRepository _repository;

        public LogisticsController(IMediator mediator, ISupplyLogisticsRepository repository)
        {
            _mediator = mediator;
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _repository.GetAllAsync());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSupplyCommand command)
        {
            var id = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetAll), new { id }, null);
        }
    }
}
