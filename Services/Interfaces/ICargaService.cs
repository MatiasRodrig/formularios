using System;
using System.Collections.Generic;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;

namespace FormulariosAPI.Services.Interfaces
{
    public interface ICargaService
    {
        IEnumerable<CargaDto> GetAll();
        IEnumerable<CargaDto> GetByArea(Guid areaId);
        CargaDto? GetById(Guid id);
        CargaDto Create(CargaCreateDto createDto);
        bool Delete(Guid id);
        CargaDto? Update(Guid id, CargaCreateDto updateDto);
    }
}
