using System.Linq;
using System.Security.Claims;
using FormulariosAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormulariosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            var areaIdClaim = User.FindFirstValue("AreaId");

            int formsCount;
            int cargasCount;
            int areasCount;
            int plantillasCount;

            if (role == "Admin" || string.IsNullOrEmpty(areaIdClaim))
            {
                // Global access
                formsCount = _context.Forms.Count(f => f.IsPublished);
                cargasCount = _context.Cargas.Count();
                areasCount = _context.Areas.Count();
                plantillasCount = _context.Plantillas.Count();
            }
            else
            {
                // Area-filtered access
                var areaId = System.Guid.Parse(areaIdClaim);
                formsCount = _context.Forms.Count(f => f.IsPublished && f.AreaId == areaId);
                cargasCount = _context.Cargas.Count(c => c.AreaId == areaId);
                areasCount = 1; // Only their area
                plantillasCount = _context.Plantillas.Count();
            }

            return Ok(new
            {
                formsCount,
                cargasCount,
                areasCount,
                plantillasCount
            });
        }
    }
}
