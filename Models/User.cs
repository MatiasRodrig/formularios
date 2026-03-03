using System;

namespace FormulariosAPI.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        
        // Roles: "Admin", "Manager", "Collector"
        public string Role { get; set; } = "Collector";

        public Guid? AreaId { get; set; }
        public Area? Area { get; set; }
    }
}
