using System;

namespace FormulariosAPI.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public Guid? AreaId { get; set; }
        public string? AreaName { get; set; }
    }

    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Collector";
        public Guid? AreaId { get; set; }
    }

    public class UpdatePasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UpdateUserRoleDto
    {
        public string Role { get; set; } = string.Empty;
        public Guid? AreaId { get; set; }
    }
}
