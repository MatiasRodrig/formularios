// backend/DTOs/CargaDto.cs

using System;

namespace FormulariosAPI.DTOs
{
    public class CargaDto
    {
        public Guid Id { get; set; }
        public Guid FormId { get; set; }
        public Guid UserId { get; set; }
        public Guid AreaId { get; set; }
        public string DataJson { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class CargaCreateDto
    {
        public Guid FormId { get; set; }
        public Guid UserId { get; set; }
        public Guid AreaId { get; set; }
        public string DataJson { get; set; } = string.Empty;
    }
}
