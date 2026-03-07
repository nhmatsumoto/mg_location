using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Interfaces;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/public")]
    public class PublicController : ControllerBase
    {
        private readonly IIncidentRepository _incidentRepository;
        private readonly ISearchAreaRepository _searchAreaRepository;

        public PublicController(IIncidentRepository incidentRepository, ISearchAreaRepository searchAreaRepository)
        {
            _incidentRepository = incidentRepository;
            _searchAreaRepository = searchAreaRepository;
        }

        [HttpGet("incidents")]
        public async Task<IActionResult> GetIncidents()
        {
            return Ok(await _incidentRepository.GetAllAsync());
        }

        [HttpGet("incidents/{incidentId}/areas")]
        public async Task<IActionResult> GetAreas(int incidentId)
        {
            return Ok(await _searchAreaRepository.GetByIncidentIdAsync(incidentId));
        }
    }
}
