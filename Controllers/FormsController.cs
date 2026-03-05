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
    public class FormsController : ControllerBase
    {
        private readonly IFormService _formService;

        public FormsController(IFormService formService)
        {
            _formService = formService;
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
        public ActionResult<IEnumerable<FormDto>> GetAll()
        {
            if (IsAdmin)
                return Ok(_formService.GetAll());
            
            if (UserAreaId.HasValue)
                return Ok(_formService.GetByArea(UserAreaId.Value));
                
            return Ok(new List<FormDto>());
        }

        [HttpGet("area/{areaId}")]
        public ActionResult<IEnumerable<FormDto>> GetByArea(Guid areaId)
        {
            if (!IsAdmin && UserAreaId != areaId)
                return Forbid();

            return Ok(_formService.GetByArea(areaId));
        }

        [HttpGet("{id}")]
        public ActionResult<FormDto> GetById(Guid id)
        {
            var form = _formService.GetById(id);
            if (form == null) return NotFound();

            if (!IsAdmin && form.AreaId != UserAreaId)
                return Forbid();

            return Ok(form);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public ActionResult<FormDto> Create([FromBody] FormCreateDto dto)
        {
            if (!IsAdmin && dto.AreaId != UserAreaId)
                return Forbid();

            var form = _formService.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = form.Id }, form);
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public ActionResult<FormDto> Update(Guid id, [FromBody] FormCreateDto dto)
        {
            var existingForm = _formService.GetById(id);
            if (existingForm == null) return NotFound();

            if (!IsAdmin && (existingForm.AreaId != UserAreaId || dto.AreaId != UserAreaId))
                return Forbid();

            var form = _formService.Update(id, dto);
            return Ok(form);
        }

        [HttpPatch("{id}/publish")]
        [Authorize(Roles = "Admin,Manager")]
        public ActionResult Publish(Guid id)
        {
            var existingForm = _formService.GetById(id);
            if (existingForm == null) return NotFound();

            if (!IsAdmin && existingForm.AreaId != UserAreaId)
                return Forbid();

            var success = _formService.Publish(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public ActionResult Delete(Guid id)
        {
            var success = _formService.Delete(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
