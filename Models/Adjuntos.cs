using System;

namespace FormulariosAPI.Models
{
    public class Adjunto
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid CargaId { get; set; }
        public Carga? Carga { get; set; }

        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty; // Local path or URL
    }
}
