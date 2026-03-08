using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [AllowAnonymous]
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
            if (User.Identity == null || !User.Identity.IsAuthenticated)
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }

            var roles = User.Claims.Where(c => c.Type == "role" || c.Type == "realm_access").Select(c => c.Value).ToList();
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                        ?? User.FindFirst("email")?.Value;
            var preferredUsername = User.FindFirst("preferred_username")?.Value
                                    ?? User.Identity.Name;

            return Ok(new
            {
                username = preferredUsername,
                email = email,
                roles = roles,
                isAuthenticated = true,
                claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            });
        }
    }
}
