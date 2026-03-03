using System;

namespace FormulariosAPI.DTOs
{
    public class AreaDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class AreaCreateDto
    {
        public string Name { get; set; } = string.Empty;
    }
}
