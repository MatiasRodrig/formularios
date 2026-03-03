using System;
using System.Collections.Generic;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;

namespace FormulariosAPI.Services.Interfaces
{
    public interface IFormService
    {
        IEnumerable<FormDto> GetAll();
        IEnumerable<FormDto> GetByArea(Guid areaId);
        FormDto? GetById(Guid id);
        FormDto Create(FormCreateDto createDto);
        bool Publish(Guid id);
        bool Delete(Guid id);
    }
}
