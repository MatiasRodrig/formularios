using System;
using System.Collections.Generic;
using FormulariosAPI.DTOs;

namespace FormulariosAPI.Services.Interfaces
{
    public interface IProfileService
    {
        /// <summary>
        /// Returns all forms that have at least one profile-key field and at least one carga.
        /// Optionally filtered by areaId for Manager/Collector roles.
        /// </summary>
        IEnumerable<ProfileFormSummaryDto> GetFormsWithProfiles(Guid? areaId = null);

        /// <summary>
        /// For a given form, returns all profile groups (one per profile-key field),
        /// each containing all distinct values and their carga counts.
        /// </summary>
        FormProfileSummaryDto? GetFormProfiles(Guid formId, Guid? areaId = null);

        /// <summary>
        /// Returns the full detail for a single profile:
        /// all cargas where keyFieldId == value, plus aggregated field values.
        /// </summary>
        ProfileDetailDto? GetProfileDetail(
            Guid formId,
            string keyFieldId,
            string value,
            Guid? areaId = null
        );
    }
}
