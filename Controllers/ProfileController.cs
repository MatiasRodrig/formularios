using System;
using FormulariosAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormulariosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfilesController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfilesController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        // ─── Helpers ──────────────────────────────────────────────────────────

        private bool IsAdmin => User.IsInRole("Admin");

        private Guid? UserAreaId
        {
            get
            {
                var claim = User.FindFirst("AreaId");
                return claim != null && Guid.TryParse(claim.Value, out var id) ? id : null;
            }
        }

        /// <summary>
        /// Returns the areaId filter to apply:
        ///   - Admin: no filter (null)
        ///   - Manager/Collector with area: their area
        ///   - Manager/Collector without area: Guid.Empty (will match nothing, effectively empty result)
        /// </summary>
        private Guid? EffectiveAreaFilter => IsAdmin ? null : (UserAreaId ?? Guid.Empty);

        // ─── Endpoints ────────────────────────────────────────────────────────

        /// <summary>
        /// GET /api/profiles/forms
        /// Returns all forms that have at least one profile-key field and at least one carga.
        /// Admins see all; Managers/Collectors see only their area.
        /// </summary>
        [HttpGet("forms")]
        [Authorize(Roles = "Admin,Manager")]
        public IActionResult GetFormsWithProfiles()
        {
            var result = _profileService.GetFormsWithProfiles(EffectiveAreaFilter);
            return Ok(result);
        }

        /// <summary>
        /// GET /api/profiles/{formId}
        /// Returns all profile groups for a form (one per profile-key field),
        /// each with all distinct values and their carga counts.
        /// </summary>
        [HttpGet("{formId:guid}")]
        [Authorize(Roles = "Admin,Manager")]
        public IActionResult GetFormProfiles(Guid formId)
        {
            var result = _profileService.GetFormProfiles(formId, EffectiveAreaFilter);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// GET /api/profiles/{formId}/{keyFieldId}/{value}
        /// Returns the full detail for a single profile:
        /// all cargas where keyFieldId == value, aggregated field values, etc.
        /// </summary>
        [HttpGet("{formId:guid}/{keyFieldId}/{value}")]
        [Authorize(Roles = "Admin,Manager")]
        public IActionResult GetProfileDetail(Guid formId, string keyFieldId, string value)
        {
            if (string.IsNullOrWhiteSpace(keyFieldId) || string.IsNullOrWhiteSpace(value))
                return BadRequest("keyFieldId and value are required.");

            var result = _profileService.GetProfileDetail(
                formId,
                keyFieldId,
                value,
                EffectiveAreaFilter
            );
            if (result == null)
                return NotFound();
            return Ok(result);
        }
    }
}
