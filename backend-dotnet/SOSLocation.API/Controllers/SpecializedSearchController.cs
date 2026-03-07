using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/search-specialized")]
    public class SpecializedSearchController : ControllerBase
    {
        private readonly IGeolocationRepository _geoRepository;
        private readonly IVisitedLocationRepository _visitedRepository;
        private readonly IFoundPeopleRepository _foundRepository;

        public SpecializedSearchController(
            IGeolocationRepository geoRepository,
            IVisitedLocationRepository visitedRepository,
            IFoundPeopleRepository foundRepository)
        {
            _geoRepository = geoRepository;
            _visitedRepository = visitedRepository;
            _foundRepository = foundRepository;
        }

        [HttpGet("geolocations")]
        public async Task<IActionResult> GetGeolocations()
        {
            return Ok(await _geoRepository.GetAllAsync());
        }

        [HttpPost("geolocations")]
        public async Task<IActionResult> CreateGeolocation([FromBody] Geolocation geolocation)
        {
            await _geoRepository.AddAsync(geolocation);
            return CreatedAtAction(nameof(GetGeolocations), new { id = geolocation.Id }, null);
        }

        [HttpGet("visited-locations")]
        public async Task<IActionResult> GetVisitedLocations()
        {
            return Ok(await _visitedRepository.GetAllAsync());
        }

        [HttpGet("found-people")]
        public async Task<IActionResult> GetFoundPeople()
        {
            return Ok(await _foundRepository.GetAllAsync());
        }
    }
}
