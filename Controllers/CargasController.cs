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
    [Authorize]
    public class CargasController : ControllerBase
    {
        private readonly ICargaService _cargaService;

        public CargasController(ICargaService cargaService)
        {
            _cargaService = cargaService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<CargaDto>> GetAll()
        {
            return Ok(_cargaService.GetAll());
        }

        [HttpGet("area/{areaId}")]
        public ActionResult<IEnumerable<CargaDto>> GetByArea(Guid areaId)
        {
            return Ok(_cargaService.GetByArea(areaId));
        }

        [HttpGet("{id}")]
        public ActionResult<CargaDto> GetById(Guid id)
        {
            var carga = _cargaService.GetById(id);
            if (carga == null)
                return NotFound();
            return Ok(carga);
        }

        [HttpPost]
        public ActionResult<CargaDto> Create([FromBody] CargaCreateDto dto)
        {
            var carga = _cargaService.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = carga.Id }, carga);
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(Guid id)
        {
            var success = _cargaService.Delete(id);
            if (!success)
                return NotFound();
            return NoContent();
        }

        [HttpPut("{id}")]
        public ActionResult<CargaDto> Update(Guid id, [FromBody] CargaCreateDto dto)
        {
            var carga = _cargaService.Update(id, dto);
            if (carga == null)
                return NotFound();
            return Ok(carga);
        }
    }
}
