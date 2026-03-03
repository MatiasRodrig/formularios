using System;

namespace FormulariosAPI.Models
{
    public class Carga
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid FormId { get; set; }
        public Form? Form { get; set; }

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public Guid AreaId { get; set; }
        public Area? Area { get; set; }

        public string DataJson { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
