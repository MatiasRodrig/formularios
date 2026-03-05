using System;
using System.Collections.Generic;
using System.Linq;
using FormulariosAPI.Data;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;
using FormulariosAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FormulariosAPI.Services
{
    public class FormService : IFormService
    {
        private readonly AppDbContext _context;

        public FormService(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<FormDto> GetAll()
        {
            return _context.Forms
                .Select(f => new FormDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    SchemaJson = f.SchemaJson,
                    AreaId = f.AreaId,
                    AreaName = f.Area != null ? f.Area.Name : "General",
                    IsPublished = f.IsPublished
                })
                .ToList();
        }

        public IEnumerable<FormDto> GetByArea(Guid areaId)
        {
            return _context.Forms
                .Where(f => f.AreaId == areaId)
                .Select(f => new FormDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    SchemaJson = f.SchemaJson,
                    AreaId = f.AreaId,
                    AreaName = f.Area != null ? f.Area.Name : "General",
                    IsPublished = f.IsPublished
                })
                .ToList();
        }

        public FormDto? GetById(Guid id)
        {
            return _context.Forms
                .Where(f => f.Id == id)
                .Select(f => new FormDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    SchemaJson = f.SchemaJson,
                    AreaId = f.AreaId,
                    AreaName = f.Area != null ? f.Area.Name : "General",
                    IsPublished = f.IsPublished
                })
                .FirstOrDefault();
        }

        public FormDto Create(FormCreateDto createDto)
        {
            var form = new Form
            {
                Id = Guid.NewGuid(),
                Name = createDto.Name,
                SchemaJson = createDto.SchemaJson,
                AreaId = createDto.AreaId,
                IsPublished = false
            };
            _context.Forms.Add(form);
            _context.SaveChanges();
            
            // Return with populated AreaName
            return GetById(form.Id)!;
        }

        public FormDto? Update(Guid id, FormCreateDto updateDto)
        {
            var form = _context.Forms.FirstOrDefault(f => f.Id == id);
            if (form == null) return null;

            form.Name = updateDto.Name;
            form.SchemaJson = updateDto.SchemaJson;
            form.AreaId = updateDto.AreaId;

            _context.SaveChanges();
            
            // Re-fetch to get Area Name and all relations
            return GetById(id);
        }

        public bool Publish(Guid id)
        {
            var form = _context.Forms.FirstOrDefault(f => f.Id == id);
            if (form == null) return false;
            
            form.IsPublished = true;
            _context.SaveChanges();
            return true;
        }

        public bool Delete(Guid id)
        {
            var form = _context.Forms.FirstOrDefault(f => f.Id == id);
            if (form == null) return false;
            
            var cargas = _context.Cargas.Where(c => c.FormId == id).ToList();
            var cargaIds = cargas.Select(c => c.Id).ToList();
            var adjuntos = _context.Adjuntos.Where(a => cargaIds.Contains(a.CargaId)).ToList();
            var plantillas = _context.Plantillas.Where(p => p.FormId == id).ToList();
            
            _context.Adjuntos.RemoveRange(adjuntos);
            _context.Cargas.RemoveRange(cargas);
            _context.Plantillas.RemoveRange(plantillas);
            _context.Forms.Remove(form);
            _context.SaveChanges();
            return true;
        }

        private static FormDto MapToDto(Form f)
        {
            return new FormDto
            {
                Id = f.Id,
                Name = f.Name,
                SchemaJson = f.SchemaJson,
                AreaId = f.AreaId,
                AreaName = f.Area?.Name ?? (f.AreaId != Guid.Empty ? $"Área ({f.AreaId.ToString().Substring(0,8)})" : "General"),
                IsPublished = f.IsPublished
            };
        }
    }
}
