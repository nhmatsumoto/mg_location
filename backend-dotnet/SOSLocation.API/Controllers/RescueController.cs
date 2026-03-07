using MediatR;
using Microsoft.AspNetCore.Mvc;
using SOSLocation.Application.Features.Rescue.Commands.CreateSearchArea;
using SOSLocation.Domain.Interfaces;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/incidents/{incidentId}/rescue")]
    public class RescueController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ISearchAreaRepository _areaRepository;
        private readonly IAssignmentRepository _assignmentRepository;

        public RescueController(IMediator mediator, ISearchAreaRepository areaRepository, IAssignmentRepository assignmentRepository)
        {
            _mediator = mediator;
            _areaRepository = areaRepository;
            _assignmentRepository = assignmentRepository;
        }

        [HttpGet("areas")]
        public async Task<IActionResult> GetAreas(Guid incidentId)
        {
            return Ok(await _areaRepository.GetByIncidentIdAsync(incidentId));
        }

        [HttpPost("areas")]
        public async Task<IActionResult> CreateArea(Guid incidentId, [FromBody] CreateSearchAreaCommand command)
        {
            command.IncidentId = incidentId;
            var id = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetAreas), new { incidentId, id }, null);
        }

        [HttpGet("assignments")]
        public async Task<IActionResult> GetAssignments(Guid incidentId)
        {
            return Ok(await _assignmentRepository.GetByIncidentIdAsync(incidentId));
        }
    }
}
