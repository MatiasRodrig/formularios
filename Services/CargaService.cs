using System;
using System.Collections.Generic;
using System.Linq;
using FormulariosAPI.Data;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;
using FormulariosAPI.Services.Interfaces;

namespace FormulariosAPI.Services
{
    public class CargaService : ICargaService
    {
        private readonly AppDbContext _context;

        public CargaService(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<CargaDto> GetAll()
        {
            return _context.Cargas.Select(c => MapToDto(c)).ToList();
        }

        public IEnumerable<CargaDto> GetByArea(Guid areaId)
        {
            return _context.Cargas.Where(c => c.AreaId == areaId).Select(c => MapToDto(c)).ToList();
        }

        public CargaDto? GetById(Guid id)
        {
            var carga = _context.Cargas.FirstOrDefault(c => c.Id == id);
            return carga == null ? null : MapToDto(carga);
        }

        public CargaDto Create(CargaCreateDto createDto)
        {
            var carga = new Carga
            {
                Id = Guid.NewGuid(),
                FormId = createDto.FormId,
                UserId = createDto.UserId,
                AreaId = createDto.AreaId,
                DataJson = createDto.DataJson,
                Timestamp = DateTime.UtcNow
            };
            _context.Cargas.Add(carga);
            _context.SaveChanges();
            
            return MapToDto(carga);
        }

        private static CargaDto MapToDto(Carga c)
        {
            return new CargaDto
            {
                Id = c.Id,
                FormId = c.FormId,
                UserId = c.UserId,
                AreaId = c.AreaId,
                DataJson = c.DataJson,
                Timestamp = c.Timestamp
            };
        }
    }
}
