using System;
using System.Collections.Generic;
using System.Linq;
using FormulariosAPI.Data;
using FormulariosAPI.DTOs;
using FormulariosAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace FormulariosAPI.Services
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;

        public ProfileService(AppDbContext context)
        {
            _context = context;
        }

        // ─── Helpers ───────────────────────────────────────────────────────────

        /// <summary>Parses SchemaJson and returns the list of field definitions.</summary>
        private static List<SchemaField> ParseFields(string schemaJson)
        {
            try
            {
                var obj = JObject.Parse(schemaJson);
                var arr = obj["fields"] as JArray;
                if (arr == null)
                    return new();
                return arr.ToObject<List<SchemaField>>() ?? new();
            }
            catch
            {
                return new();
            }
        }

        /// <summary>Parses DataJson and returns key→value dictionary.</summary>
        private static Dictionary<string, string?> ParseData(string dataJson)
        {
            try
            {
                var obj = JObject.Parse(dataJson);
                var result = new Dictionary<string, string?>();
                foreach (var prop in obj.Properties())
                {
                    var token = prop.Value;
                    if (token.Type == JTokenType.Null)
                        result[prop.Name] = null;
                    else if (token.Type == JTokenType.Object || token.Type == JTokenType.Array)
                        result[prop.Name] = token.ToString(Formatting.None);
                    else
                        result[prop.Name] = token.ToString();
                }
                return result;
            }
            catch
            {
                return new();
            }
        }

        /// <summary>
        /// Builds a display title from the carga's data using isTitleField fields,
        /// ordered by titleOrder. Returns null if no title fields exist or all are empty.
        /// </summary>
        private static string? BuildTitle(
            Dictionary<string, string?> data,
            List<SchemaField> titleFields
        )
        {
            var ordered = titleFields
                .Where(f => f.IsTitleField)
                .OrderBy(f => f.TitleOrder ?? int.MaxValue)
                .ToList();

            var parts = ordered
                .Select(f => data.TryGetValue(f.Id, out var val) ? val : null)
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .ToList();

            return parts.Count > 0 ? string.Join(" · ", parts) : null;
        }

        // ─── Public methods ─────────────────────────────────────────────────────

        public IEnumerable<ProfileFormSummaryDto> GetFormsWithProfiles(Guid? areaId = null)
        {
            var formsQuery = _context.Forms.Include(f => f.Area).AsNoTracking();

            if (areaId.HasValue)
                formsQuery = formsQuery.Where(f => f.AreaId == areaId.Value);

            var forms = formsQuery.ToList();
            var result = new List<ProfileFormSummaryDto>();

            foreach (var form in forms)
            {
                var fields = ParseFields(form.SchemaJson);
                var profileKeyFields = fields.Where(f => f.IsProfileKey).ToList();
                if (!profileKeyFields.Any())
                    continue;

                // Only include forms that actually have cargas
                var formCargasQuery = _context.Cargas.Where(c => c.FormId == form.Id);
                if (areaId.HasValue)
                    formCargasQuery = formCargasQuery.Where(c => c.AreaId == areaId.Value);

                var formCargas = formCargasQuery.AsNoTracking().ToList();
                if (!formCargas.Any())
                    continue;

                var keyFieldDtos = new List<ProfileKeyFieldDto>();
                foreach (var keyField in profileKeyFields)
                {
                    // Count how many distinct non-empty values exist for this field across cargas
                    var distinctValues = formCargas
                        .Select(c => ParseData(c.DataJson))
                        .Select(d => d.TryGetValue(keyField.Id, out var v) ? v : null)
                        .Where(v => !string.IsNullOrWhiteSpace(v))
                        .Distinct()
                        .Count();

                    keyFieldDtos.Add(
                        new ProfileKeyFieldDto
                        {
                            FieldId = keyField.Id,
                            FieldLabel = keyField.Label,
                            ProfileLabel = keyField.ProfileLabel,
                            ProfileIcon = keyField.ProfileIcon,
                            UniqueValuesCount = distinctValues,
                        }
                    );
                }

                result.Add(
                    new ProfileFormSummaryDto
                    {
                        FormId = form.Id,
                        FormName = form.Name,
                        AreaName = form.Area?.Name ?? string.Empty,
                        CargaCount = formCargas.Count,
                        ProfileKeyFields = keyFieldDtos,
                    }
                );
            }

            return result.OrderByDescending(r => r.CargaCount);
        }

        public FormProfileSummaryDto? GetFormProfiles(Guid formId, Guid? areaId = null)
        {
            var form = _context
                .Forms.Include(f => f.Area)
                .AsNoTracking()
                .FirstOrDefault(f => f.Id == formId);

            if (form == null)
                return null;

            // Area access check
            if (areaId.HasValue && form.AreaId != areaId.Value)
                return null;

            var fields = ParseFields(form.SchemaJson);
            var profileKeyFields = fields.Where(f => f.IsProfileKey).ToList();
            var titleFields = fields.Where(f => f.IsTitleField).ToList();

            var cargasQuery = _context.Cargas.Where(c => c.FormId == formId);
            if (areaId.HasValue)
                cargasQuery = cargasQuery.Where(c => c.AreaId == areaId.Value);

            var cargas = cargasQuery.AsNoTracking().ToList();

            var groups = new List<ProfileGroupDto>();

            foreach (var keyField in profileKeyFields)
            {
                // Group cargas by the value of this key field
                var grouped =
                    new Dictionary<
                        string,
                        List<(string DataJson, DateTime Timestamp, Guid UserId)>
                    >();

                foreach (var carga in cargas)
                {
                    var data = ParseData(carga.DataJson);
                    if (
                        !data.TryGetValue(keyField.Id, out var val)
                        || string.IsNullOrWhiteSpace(val)
                    )
                        continue;

                    var key = val!.Trim();
                    if (!grouped.ContainsKey(key))
                        grouped[key] = new();
                    grouped[key].Add((carga.DataJson, carga.Timestamp, carga.UserId));
                }

                var profiles = new List<ProfileDto>();
                foreach (var (value, cargasList) in grouped)
                {
                    // Get the most recent carga for this profile to build the title
                    var latestRaw = cargasList.OrderByDescending(c => c.Timestamp).First();
                    var latestData = ParseData(latestRaw.DataJson);
                    var title = BuildTitle(latestData, titleFields);

                    profiles.Add(
                        new ProfileDto
                        {
                            KeyFieldId = keyField.Id,
                            KeyFieldLabel = keyField.Label,
                            KeyFieldProfileLabel = keyField.ProfileLabel,
                            KeyFieldProfileIcon = keyField.ProfileIcon,
                            Value = value,
                            CargaCount = cargasList.Count,
                            LatestTimestamp = latestRaw.Timestamp,
                            LatestUserId = latestRaw.UserId.ToString(),
                            Title = title,
                        }
                    );
                }

                groups.Add(
                    new ProfileGroupDto
                    {
                        KeyFieldId = keyField.Id,
                        KeyFieldLabel = keyField.Label,
                        ProfileLabel = keyField.ProfileLabel,
                        ProfileIcon = keyField.ProfileIcon,
                        // Sort: most cargas first, then alphabetically
                        Profiles = profiles
                            .OrderByDescending(p => p.CargaCount)
                            .ThenBy(p => p.Value)
                            .ToList(),
                    }
                );
            }

            return new FormProfileSummaryDto
            {
                FormId = form.Id,
                FormName = form.Name,
                AreaName = form.Area?.Name ?? string.Empty,
                TotalCargas = cargas.Count,
                Groups = groups,
            };
        }

        public ProfileDetailDto? GetProfileDetail(
            Guid formId,
            string keyFieldId,
            string value,
            Guid? areaId = null
        )
        {
            var form = _context
                .Forms.Include(f => f.Area)
                .AsNoTracking()
                .FirstOrDefault(f => f.Id == formId);

            if (form == null)
                return null;
            if (areaId.HasValue && form.AreaId != areaId.Value)
                return null;

            var fields = ParseFields(form.SchemaJson);
            var keyField = fields.FirstOrDefault(f => f.Id == keyFieldId && f.IsProfileKey);
            if (keyField == null)
                return null;

            var normalizedValue = value.Trim();

            var cargasQuery = _context.Cargas.Where(c => c.FormId == formId);
            if (areaId.HasValue)
                cargasQuery = cargasQuery.Where(c => c.AreaId == areaId.Value);

            var allCargas = cargasQuery.AsNoTracking().ToList();

            // Filter to only cargas where keyFieldId == value
            var matchingCargas = allCargas
                .Where(c =>
                {
                    var data = ParseData(c.DataJson);
                    return data.TryGetValue(keyFieldId, out var v)
                        && !string.IsNullOrWhiteSpace(v)
                        && v!.Trim().Equals(normalizedValue, StringComparison.OrdinalIgnoreCase);
                })
                .OrderByDescending(c => c.Timestamp)
                .ToList();

            if (!matchingCargas.Any())
                return null;

            // Build aggregated field values: fieldId → distinct non-empty values (most recent last)
            var aggregated = new Dictionary<string, List<string>>();
            foreach (var field in fields.Where(f => f.Type != "group"))
            {
                var vals = matchingCargas
                    .Select(c => ParseData(c.DataJson))
                    .Select(d => d.TryGetValue(field.Id, out var v) ? v : null)
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Select(v => v!)
                    .ToList();

                if (vals.Any())
                    aggregated[field.Id] = vals;
            }

            var cargaDtos = matchingCargas
                .Select(c => new CargaDto
                {
                    Id = c.Id,
                    FormId = c.FormId,
                    UserId = c.UserId,
                    AreaId = c.AreaId,
                    DataJson = c.DataJson,
                    Timestamp = c.Timestamp,
                })
                .ToList();

            return new ProfileDetailDto
            {
                KeyFieldId = keyFieldId,
                KeyFieldLabel = keyField.Label,
                ProfileLabel = keyField.ProfileLabel,
                ProfileIcon = keyField.ProfileIcon,
                Value = normalizedValue,
                CargaCount = matchingCargas.Count,
                Cargas = cargaDtos,
                AggregatedFields = aggregated,
                // fieldId → label for every non-group field
                FieldLabels = fields
                    .Where(f => f.Type != "group")
                    .ToDictionary(f => f.Id, f => f.Label),
                // Ordered list of title field IDs
                TitleFieldIds = fields
                    .Where(f => f.IsTitleField)
                    .OrderBy(f => f.TitleOrder ?? int.MaxValue)
                    .Select(f => f.Id)
                    .ToList(),
            };
        }
    }

    // ─── Internal model for deserializing field definitions ───────────────────
    // Only the properties we need — the rest are ignored by Newtonsoft.
    internal class SchemaField
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("type")]
        public string Type { get; set; } = string.Empty;

        [JsonProperty("label")]
        public string Label { get; set; } = string.Empty;

        [JsonProperty("variableName")]
        public string? VariableName { get; set; }

        [JsonProperty("isTitleField")]
        public bool IsTitleField { get; set; }

        [JsonProperty("titleOrder")]
        public int? TitleOrder { get; set; }

        [JsonProperty("isProfileKey")]
        public bool IsProfileKey { get; set; }

        [JsonProperty("profileLabel")]
        public string? ProfileLabel { get; set; }

        [JsonProperty("profileIcon")]
        public string? ProfileIcon { get; set; }
    }
}
