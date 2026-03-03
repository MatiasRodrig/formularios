using System;

namespace FormulariosAPI.DTOs.Auth
{
    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Collector"; // Default role
        public Guid? AreaId { get; set; }
    }
}
