using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIGO.Infrastructure.Persistence;
using SIGO.Domain.Entities;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProvinciaController : ControllerBase
    {
        private readonly SigoDbContext _context;

        public ProvinciaController(SigoDbContext context)
        {
            _context = context;
        }

        // GET: api/provincia
        [HttpGet]
        public async Task<IActionResult> GetProvincia()
        {
            var provincias = await _context.Provincias.ToListAsync(); 
            return Ok(provincias);
        }

        // POST: api/provincia
        [HttpPost]
        public async Task<IActionResult> AddProvincia([FromBody] Provincia provincia)
        {
            if (provincia == null)
                return BadRequest("La provincia no puede ser nula.");

            _context.Provincias.Add(provincia); 
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProvincia), new { id = provincia.ProvinciaId }, provincia);
        }
    }
}
