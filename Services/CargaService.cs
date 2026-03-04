using System;
using System.Collections.Generic;
using System.Linq;
using FormulariosAPI.Data;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;
using FormulariosAPI.Services.Interfaces;
using Newtonsoft.Json.Linq;
using System.IO;

namespace FormulariosAPI.Services
{
    public class CargaService : ICargaService
    {
        private readonly AppDbContext _context;

        public CargaService(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<CargaDto> GetAll()
        {
            return _context.Cargas.Select(c => MapToDto(c)).ToList();
        }

        public IEnumerable<CargaDto> GetByArea(Guid areaId)
        {
            return _context.Cargas.Where(c => c.AreaId == areaId).Select(c => MapToDto(c)).ToList();
        }

        public CargaDto? GetById(Guid id)
        {
            var carga = _context.Cargas.FirstOrDefault(c => c.Id == id);
            return carga == null ? null : MapToDto(carga);
        }

        public CargaDto Create(CargaCreateDto createDto)
        {
            var dataJsonString = ProcessMediaFiles(createDto.DataJson);

            var carga = new Carga
            {
                Id = Guid.NewGuid(),
                FormId = createDto.FormId,
                UserId = createDto.UserId,
                AreaId = createDto.AreaId,
                DataJson = dataJsonString,
                Timestamp = DateTime.UtcNow
            };
            _context.Cargas.Add(carga);
            _context.SaveChanges();
            
            return MapToDto(carga);
        }

        private static CargaDto MapToDto(Carga c)
        {
            return new CargaDto
            {
                Id = c.Id,
                FormId = c.FormId,
                UserId = c.UserId,
                AreaId = c.AreaId,
                DataJson = c.DataJson,
                Timestamp = c.Timestamp
            };
        }

        private static string ProcessMediaFiles(string dataJson)
        {
            try
            {
                var dictObj = JObject.Parse(dataJson);
                var propertiesToUpdate = new Dictionary<string, string>();

                foreach (var prop in dictObj.Properties())
                {
                    if (prop.Value is JObject mediaObj && 
                        mediaObj.ContainsKey("dataUrl") && 
                        mediaObj.ContainsKey("name"))
                    {
                        var dataUrl = mediaObj["dataUrl"]?.ToString();
                        var fileName = mediaObj["name"]?.ToString();
                        var mediaType = mediaObj["type"]?.ToString() ?? "file";

                        if (!string.IsNullOrEmpty(dataUrl) && dataUrl.Contains("base64,"))
                        {
                            var base64Data = dataUrl.Substring(dataUrl.IndexOf("base64,") + 7);
                            var bytes = Convert.FromBase64String(base64Data);

                            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cargas");
                            if (!Directory.Exists(uploadDir))
                                Directory.CreateDirectory(uploadDir);

                            var extension = Path.GetExtension(fileName);
                            if (string.IsNullOrEmpty(extension))
                            {
                                if (mediaType.Contains("image/png")) extension = ".png";
                                else if (mediaType.Contains("image/jpeg")) extension = ".jpg";
                                else if (mediaType.Contains("audio/webm")) extension = ".webm";
                                else if (mediaType.Contains("video/mp4")) extension = ".mp4";
                            }

                            var newFileName = $"{Guid.NewGuid()}{extension}";
                            var filePath = Path.Combine(uploadDir, newFileName);

                            File.WriteAllBytes(filePath, bytes);

                            // The url to access it via API Domain
                            var relativePath = $"/uploads/cargas/{newFileName}";
                            
                            propertiesToUpdate[prop.Name] = relativePath;
                        }
                    }
                }

                // Update original object with string urls instead of huge base64
                foreach (var kvp in propertiesToUpdate)
                {
                    dictObj[kvp.Key] = kvp.Value;
                }

                return dictObj.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error processing Media base64: " + ex.Message);
                return dataJson; // Fallback
            }
        }
    }
}
