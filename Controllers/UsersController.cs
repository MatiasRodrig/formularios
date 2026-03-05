using System;
using FormulariosAPI.DTOs;
using FormulariosAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormulariosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult Create([FromBody] CreateUserDto dto)
        {
            var created = _userService.Create(dto);
            if (created == null)
                return BadRequest(new { message = "El nombre de usuario ya está en uso" });

            return CreatedAtAction(nameof(GetAll), created);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Delete(Guid id)
        {
            var success = _userService.Delete(id);
            if (!success)
                return NotFound(new { message = "Usuario no encontrado" });

            return NoContent();
        }

        [HttpPatch("{id}/role")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateRoleArea(Guid id, [FromBody] UpdateUserRoleDto dto)
        {
            var success = _userService.UpdateRoleArea(id, dto.Role, dto.AreaId);
            if (!success)
                return NotFound(new { message = "Usuario no encontrado" });

            return NoContent();
        }

        [HttpPatch("me/password")]
        [Authorize]
        public IActionResult UpdatePassword([FromBody] UpdatePasswordDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();

            var success = _userService.UpdatePassword(userId, dto.NewPassword);
            if (!success)
                return NotFound(new { message = "Usuario no encontrado" });

            return NoContent();
        }
    }
}
