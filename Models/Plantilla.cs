using System;

namespace FormulariosAPI.Models
{
    public class Plantilla
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        
        // This could be HTML or base64 docx depending on the need
        public string TemplateContent { get; set; } = string.Empty;
        
        public Guid FormId { get; set; }
        public Form? Form { get; set; }
    }
}
