using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SOSLocation.Domain.Common;
using SOSLocation.Application.Features.Operations.Queries.GetSnapshot;
using System.Threading.Tasks;
using Microsoft.AspNetCore.OutputCaching;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/operations")]
    public class OperationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OperationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [AllowAnonymous]
        [HttpGet("snapshot")]
        [OutputCache(PolicyName = "Cache1Min")]
        public async Task<ActionResult<Result<OperationsSnapshotDto>>> GetSnapshot()
        {
            var result = await _mediator.Send(new GetOperationsSnapshotQuery());
            return Ok(Result<OperationsSnapshotDto>.Success(result));
        }
    }
}
