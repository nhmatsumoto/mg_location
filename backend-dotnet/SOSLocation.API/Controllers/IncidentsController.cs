using MediatR;
using Microsoft.AspNetCore.Mvc;
using SOSLocation.Application.DTOs.Incidents;
using SOSLocation.Application.Features.Incidents.Commands.CreateIncident;
using SOSLocation.Application.Features.Incidents.Queries.GetIncidents;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IncidentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public IncidentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IncidentDto>>> GetAll()
        {
            var query = new GetIncidentsQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Create(CreateIncidentCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(id);
        }
    }
}
