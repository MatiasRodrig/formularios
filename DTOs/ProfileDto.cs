using System;
using System.Collections.Generic;

namespace FormulariosAPI.DTOs
{
    // Represents one "profile" — a unique value of a profile-key field, with all its cargas
    public class ProfileDto
    {
        public string KeyFieldId { get; set; } = string.Empty;
        public string KeyFieldLabel { get; set; } = string.Empty;
        public string? KeyFieldProfileLabel { get; set; }
        public string? KeyFieldProfileIcon { get; set; }
        public string Value { get; set; } = string.Empty;
        public int CargaCount { get; set; }
        public DateTime? LatestTimestamp { get; set; }
        public string? LatestUserId { get; set; }

        // Title built from isTitleField fields of the latest carga
        public string? Title { get; set; }
    }

    // Summary of all profile groups for a given form
    public class FormProfileSummaryDto
    {
        public Guid FormId { get; set; }
        public string FormName { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public int TotalCargas { get; set; }
        public List<ProfileGroupDto> Groups { get; set; } = new();
    }

    // One profile-key field and all its distinct values
    public class ProfileGroupDto
    {
        public string KeyFieldId { get; set; } = string.Empty;
        public string KeyFieldLabel { get; set; } = string.Empty;
        public string? ProfileLabel { get; set; }
        public string? ProfileIcon { get; set; }
        public List<ProfileDto> Profiles { get; set; } = new();
    }

    // Full detail of a single profile (key + value)
    public class ProfileDetailDto
    {
        public string KeyFieldId { get; set; } = string.Empty;
        public string KeyFieldLabel { get; set; } = string.Empty;
        public string? ProfileLabel { get; set; }
        public string? ProfileIcon { get; set; }
        public string Value { get; set; } = string.Empty;
        public int CargaCount { get; set; }

        /// <summary>All cargas that share this key=value, ordered newest first.</summary>
        public List<CargaDto> Cargas { get; set; } = new();

        /// <summary>fieldId → list of non-empty values seen across all matching cargas (most recent last).</summary>
        public Dictionary<string, List<string>> AggregatedFields { get; set; } = new();

        /// <summary>fieldId → label — lets the frontend display human-readable field names.</summary>
        public Dictionary<string, string> FieldLabels { get; set; } = new();

        /// <summary>Ordered list of fieldIds marked as isTitleField, sorted by titleOrder.</summary>
        public List<string> TitleFieldIds { get; set; } = new();
    }

    // Lightweight list of forms that have at least one profile-key field and at least one carga
    public class ProfileFormSummaryDto
    {
        public Guid FormId { get; set; }
        public string FormName { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public int CargaCount { get; set; }
        public List<ProfileKeyFieldDto> ProfileKeyFields { get; set; } = new();
    }

    public class ProfileKeyFieldDto
    {
        public string FieldId { get; set; } = string.Empty;
        public string FieldLabel { get; set; } = string.Empty;
        public string? ProfileLabel { get; set; }
        public string? ProfileIcon { get; set; }
        public int UniqueValuesCount { get; set; }
    }
}
