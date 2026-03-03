using System;
using System.Collections.Generic;
using System.Linq;
using FormulariosAPI.Data;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;
using FormulariosAPI.Services.Interfaces;

namespace FormulariosAPI.Services
{
    public class AreaService : IAreaService
    {
        private readonly AppDbContext _context;

        public AreaService(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<AreaDto> GetAll()
        {
            return _context.Areas.Select(a => new AreaDto { Id = a.Id, Name = a.Name }).ToList();
        }

        public AreaDto? GetById(Guid id)
        {
            var area = _context.Areas.FirstOrDefault(a => a.Id == id);
            if (area == null) return null;
            return new AreaDto { Id = area.Id, Name = area.Name };
        }

        public AreaDto Create(AreaCreateDto createDto)
        {
            var newArea = new Area
            {
                Id = Guid.NewGuid(),
                Name = createDto.Name
            };
            _context.Areas.Add(newArea);
            _context.SaveChanges();
            
            return new AreaDto { Id = newArea.Id, Name = newArea.Name };
        }

        public bool Delete(Guid id)
        {
            var area = _context.Areas.FirstOrDefault(a => a.Id == id);
            if (area == null) return false;
            
            _context.Areas.Remove(area);
            _context.SaveChanges();
            return true;
        }
    }
}
