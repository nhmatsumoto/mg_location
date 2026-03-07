using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SOSLocation.API.Data;
using SOSLocation.API.Models;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/missing-persons")]
    public class MissingPersonsController : ControllerBase
    {
        private readonly SOSLocationDbContext _context;

        public MissingPersonsController(SOSLocationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MissingPerson>>> GetMissingPersons()
        {
            return await _context.MissingPersons.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<MissingPerson>> PostMissingPerson(MissingPerson person)
        {
            _context.MissingPersons.Add(person);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMissingPersons), new { id = person.Id }, person);
        }
    }
}
