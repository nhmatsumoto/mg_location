using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/data-sources")]
    public class DataSourcesController : ControllerBase
    {
        private readonly IDataSourceRepository _repository;

        public DataSourcesController(IDataSourceRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DataSource>>> GetAll()
        {
            var sources = await _repository.GetAllActiveAsync();
            return Ok(sources);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DataSource>> GetById(Guid id)
        {
            var source = await _repository.GetByIdAsync(id);
            if (source == null) return NotFound();
            return Ok(source);
        }

        [HttpPost]
        public async Task<ActionResult<DataSource>> Create(DataSource source)
        {
            await _repository.AddAsync(source);
            return CreatedAtAction(nameof(GetById), new { id = source.Id }, source);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, DataSource source)
        {
            if (id != source.Id) return BadRequest();
            await _repository.UpdateAsync(source);
            return NoContent();
        }
    }
}
