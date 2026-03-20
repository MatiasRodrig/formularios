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

        private bool IsAdmin => User.IsInRole("Admin");
        private Guid? UserAreaId 
        {
            get 
            {
                var claim = User.FindFirst("AreaId");
                return claim != null && Guid.TryParse(claim.Value, out var id) ? id : null;
            }
        }

        [HttpGet]
        public ActionResult<IEnumerable<CargaDto>> GetAll()
        {
            if (IsAdmin)
                return Ok(_cargaService.GetAll());
            
            if (UserAreaId.HasValue)
                return Ok(_cargaService.GetByArea(UserAreaId.Value));
                
            return Ok(new List<CargaDto>());
        }

        [HttpGet("area/{areaId}")]
        public ActionResult<IEnumerable<CargaDto>> GetByArea(Guid areaId)
        {
            if (!IsAdmin && UserAreaId != areaId)
                return Forbid();

            return Ok(_cargaService.GetByArea(areaId));
        }

        [HttpGet("{id}")]
        public ActionResult<CargaDto> GetById(Guid id)
        {
            var carga = _cargaService.GetById(id);
            if (carga == null)
                return NotFound();

            if (!IsAdmin && carga.AreaId != UserAreaId)
                return Forbid();

            return Ok(carga);
        }

        [HttpPost]
        public ActionResult<CargaDto> Create([FromBody] CargaCreateDto dto)
        {
            if (!IsAdmin && dto.AreaId != UserAreaId)
                return Forbid();

            var carga = _cargaService.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = carga.Id }, carga);
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(Guid id)
        {
            var carga = _cargaService.GetById(id);
            if (carga == null)
                return NotFound();

            if (!IsAdmin && carga.AreaId != UserAreaId)
                return Forbid();

            var success = _cargaService.Delete(id);
            if (!success)
                return NotFound();
            return NoContent();
        }

        [HttpPut("{id}")]
        public ActionResult<CargaDto> Update(Guid id, [FromBody] CargaCreateDto dto)
        {
            var existingCarga = _cargaService.GetById(id);
            if (existingCarga == null)
                return NotFound();

            if (!IsAdmin && (existingCarga.AreaId != UserAreaId || dto.AreaId != UserAreaId))
                return Forbid();

            var carga = _cargaService.Update(id, dto);
            if (carga == null)
                return NotFound();
            return Ok(carga);
        }
    }
}
