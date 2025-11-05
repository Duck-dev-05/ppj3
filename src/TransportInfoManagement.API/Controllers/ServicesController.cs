using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ServicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Service>>> GetServices()
    {
        return await _context.Services.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Service>> GetService(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null) return NotFound();
        return service;
    }

    [HttpPost]
    public async Task<ActionResult<Service>> CreateService(Service service)
    {
        service.CreatedAt = DateTime.UtcNow;
        _context.Services.Add(service);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetService), new { id = service.Id }, service);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(int id, Service service)
    {
        if (id != service.Id) return BadRequest();
        
        _context.Entry(service).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ServiceExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null) return NotFound();
        
        _context.Services.Remove(service);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("fees")]
    public async Task<ActionResult<IEnumerable<ServiceFee>>> GetServiceFees()
    {
        return await _context.ServiceFees
            .Include(sf => sf.Service)
            .ToListAsync();
    }

    [HttpPut("fees/{id}")]
    public async Task<IActionResult> UpdateServiceFee(int id, ServiceFee serviceFee)
    {
        if (id != serviceFee.Id) return BadRequest();
        
        serviceFee.UpdatedAt = DateTime.UtcNow;
        _context.Entry(serviceFee).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ServiceFeeExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    private bool ServiceExists(int id) => _context.Services.Any(e => e.Id == id);
    private bool ServiceFeeExists(int id) => _context.ServiceFees.Any(e => e.Id == id);
}

