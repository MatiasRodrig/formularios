using System;
using System.Collections.Generic;

namespace FormulariosAPI.Models
{
    public class Area
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Form> Forms { get; set; } = new List<Form>();
    }
}
