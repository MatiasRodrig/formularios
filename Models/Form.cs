using System;

namespace FormulariosAPI.Models
{
    public class Form
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string SchemaJson { get; set; } = string.Empty;
        public bool IsPublished { get; set; } = false;

        public Guid AreaId { get; set; }
        public Area? Area { get; set; }
    }
}
