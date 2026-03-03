using System;
using System.Collections.Generic;
using FormulariosAPI.DTOs;
using FormulariosAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormulariosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require Auth by default
    public class AreasController : ControllerBase
    {
        private readonly IAreaService _areaService;

        public AreasController(IAreaService areaService)
        {
            _areaService = areaService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<AreaDto>> GetAll()
        {
            return Ok(_areaService.GetAll());
        }

        [HttpGet("{id}")]
        public ActionResult<AreaDto> GetById(Guid id)
        {
            var area = _areaService.GetById(id);
            if (area == null) return NotFound();
            return Ok(area);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")] // Only Admin/Manager can create
        public ActionResult<AreaDto> Create([FromBody] AreaCreateDto dto)
        {
            var area = _areaService.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = area.Id }, area);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only Admin can delete
        public ActionResult Delete(Guid id)
        {
            var success = _areaService.Delete(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
