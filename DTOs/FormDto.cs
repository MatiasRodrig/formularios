using System;

namespace FormulariosAPI.DTOs
{
    public class FormDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SchemaJson { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public Guid AreaId { get; set; }
    }

    public class FormCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string SchemaJson { get; set; } = string.Empty;
        public Guid AreaId { get; set; }
    }
}
