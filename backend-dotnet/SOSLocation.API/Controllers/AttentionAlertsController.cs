using MediatR;
using Microsoft.AspNetCore.Mvc;
using SOSLocation.Application.DTOs.Alerts;
using SOSLocation.Application.Features.AttentionAlerts.Queries.GetAlerts;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/integrations/alerts")]
    public class AttentionAlertsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AttentionAlertsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlertDto>>> GetAll()
        {
            var query = new GetAlertsQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
