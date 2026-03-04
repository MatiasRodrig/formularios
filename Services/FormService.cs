using System;
using System.Collections.Generic;
using System.Linq;
using FormulariosAPI.Data;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;
using FormulariosAPI.Services.Interfaces;

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
            return _context.Forms.Select(f => MapToDto(f)).ToList();
        }

        public IEnumerable<FormDto> GetByArea(Guid areaId)
        {
            return _context.Forms.Where(f => f.AreaId == areaId).Select(f => MapToDto(f)).ToList();
        }

        public FormDto? GetById(Guid id)
        {
            var form = _context.Forms.FirstOrDefault(f => f.Id == id);
            return form == null ? null : MapToDto(form);
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
            
            return MapToDto(form);
        }

        public FormDto? Update(Guid id, FormCreateDto updateDto)
        {
            var form = _context.Forms.FirstOrDefault(f => f.Id == id);
            if (form == null) return null;

            form.Name = updateDto.Name;
            form.SchemaJson = updateDto.SchemaJson;
            form.AreaId = updateDto.AreaId;

            _context.SaveChanges();
            return MapToDto(form);
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
                IsPublished = f.IsPublished
            };
        }
    }
}
