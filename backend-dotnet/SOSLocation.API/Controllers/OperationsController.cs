using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SOSLocation.Application.Features.Operations.Queries.GetSnapshot;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OperationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OperationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [AllowAnonymous]
        [HttpGet("snapshot")]
        public async Task<IActionResult> GetSnapshot()
        {
            return Ok(await _mediator.Send(new GetOperationsSnapshotQuery()));
        }
    }
}
