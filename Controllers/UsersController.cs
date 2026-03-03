using System;
using FormulariosAPI.DTOs;
using FormulariosAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormulariosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateUserDto dto)
        {
            var created = _userService.Create(dto);
            if (created == null)
                return BadRequest(new { message = "El nombre de usuario ya está en uso" });

            return CreatedAtAction(nameof(GetAll), created);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var success = _userService.Delete(id);
            if (!success)
                return NotFound(new { message = "Usuario no encontrado" });

            return NoContent();
        }
    }
}
