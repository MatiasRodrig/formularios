using System;
using System.Collections.Generic;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;

namespace FormulariosAPI.Services.Interfaces
{
    public interface IAreaService
    {
        IEnumerable<AreaDto> GetAll();
        AreaDto? GetById(Guid id);
        AreaDto Create(AreaCreateDto createDto);
        bool Delete(Guid id);
    }
}
