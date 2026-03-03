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

        [HttpGet]
        public ActionResult<IEnumerable<FormDto>> GetAll()
        {
            return Ok(_formService.GetAll());
        }

        [HttpGet("area/{areaId}")]
        public ActionResult<IEnumerable<FormDto>> GetByArea(Guid areaId)
        {
            return Ok(_formService.GetByArea(areaId));
        }

        [HttpGet("{id}")]
        public ActionResult<FormDto> GetById(Guid id)
        {
            var form = _formService.GetById(id);
            if (form == null) return NotFound();
            return Ok(form);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public ActionResult<FormDto> Create([FromBody] FormCreateDto dto)
        {
            var form = _formService.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = form.Id }, form);
        }

        [HttpPatch("{id}/publish")]
        [Authorize(Roles = "Admin,Manager")]
        public ActionResult Publish(Guid id)
        {
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
