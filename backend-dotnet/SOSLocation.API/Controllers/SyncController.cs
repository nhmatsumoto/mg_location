using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class SyncController : ControllerBase
    {
        [HttpGet("sync")]
        public IActionResult SyncEvents()
        {
            return Ok(new { lastEventId = 100, syncedAt = DateTime.UtcNow });
        }

        [HttpGet("events")]
        public IActionResult ListEvents()
        {
            return Ok(new List<object>
            {
                new { id = 1, type = "IncidentCreated", timestamp = DateTime.UtcNow.AddMinutes(-10) },
                new { id = 2, type = "AlertDispatched", timestamp = DateTime.UtcNow.AddMinutes(-5) }
            });
        }
    }
}
