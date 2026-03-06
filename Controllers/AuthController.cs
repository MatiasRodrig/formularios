using FormulariosAPI.DTOs.Auth;
using FormulariosAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FormulariosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public ActionResult Login([FromBody] LoginDto dto)
        {
            try
            {
                var token = _authService.Login(dto);
                if (token == null)
                    return Unauthorized(new { message = "Credenciales incorrectas" });

                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public ActionResult Register([FromBody] RegisterDto dto)
        {
            var success = _authService.Register(dto);
            if (!success)
            {
                return BadRequest(new { message = "El usuario ya existe" });
            }

            return Ok(new { message = "Usuario creado exitosamente" });
        }
    }
}
