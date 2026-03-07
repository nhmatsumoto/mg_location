using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login()
        {
            // Placeholder: Keycloak handles actual token issuance
            return Ok(new { message = "Redirect to Keycloak for authentication." });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new { user = User.Identity?.Name, isAuthenticated = User.Identity?.IsAuthenticated ?? false });
        }
    }
}
