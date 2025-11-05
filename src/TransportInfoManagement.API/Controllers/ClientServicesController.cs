using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientServicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClientService>>> GetClientServices([FromQuery] int? clientId)
    {
        var query = _context.ClientServices
            .Include(cs => cs.Client)
            .Include(cs => cs.Service)
            .Include(cs => cs.Employee)
            .AsQueryable();

        if (clientId.HasValue)
            query = query.Where(cs => cs.ClientId == clientId.Value);

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClientService>> GetClientService(int id)
    {
        var clientService = await _context.ClientServices
            .Include(cs => cs.Client)
            .Include(cs => cs.Service)
            .Include(cs => cs.Employee)
            .FirstOrDefaultAsync(cs => cs.Id == id);

        if (clientService == null) return NotFound();
        return clientService;
    }

    [HttpPost]
    public async Task<ActionResult<ClientService>> CreateClientService(ClientService clientService)
    {
        clientService.CreatedAt = DateTime.UtcNow;
        if (clientService.StartDate == default)
            clientService.StartDate = DateTime.UtcNow;

        _context.ClientServices.Add(clientService);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetClientService), new { id = clientService.Id }, clientService);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClientService(int id, ClientService clientService)
    {
        if (id != clientService.Id) return BadRequest();
        
        _context.Entry(clientService).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ClientServiceExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClientService(int id)
    {
        var clientService = await _context.ClientServices.FindAsync(id);
        if (clientService == null) return NotFound();
        
        _context.ClientServices.Remove(clientService);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("calculate-cost/{clientId}")]
    public async Task<ActionResult<object>> CalculateTotalCost(int clientId)
    {
        var clientServices = await _context.ClientServices
            .Include(cs => cs.Service)
            .Where(cs => cs.ClientId == clientId && cs.IsActive)
            .ToListAsync();

        decimal totalCost = 0;
        var details = new List<object>();

        foreach (var cs in clientServices)
        {
            var serviceFee = await _context.ServiceFees
                .FirstOrDefaultAsync(sf => sf.ServiceId == cs.ServiceId);

            if (serviceFee != null)
            {
                var days = (DateTime.UtcNow - cs.StartDate).Days + 1;
                if (cs.EndDate.HasValue)
                {
                    days = (cs.EndDate.Value - cs.StartDate).Days + 1;
                }

                var cost = serviceFee.FeePerDayPerEmployee * cs.NumberOfEmployees * days;
                totalCost += cost;

                details.Add(new
                {
                    ServiceName = cs.Service?.Name,
                    NumberOfEmployees = cs.NumberOfEmployees,
                    Days = days,
                    FeePerDayPerEmployee = serviceFee.FeePerDayPerEmployee,
                    Cost = cost
                });
            }
        }

        return Ok(new { TotalCost = totalCost, Details = details });
    }

    private bool ClientServiceExists(int id) => _context.ClientServices.Any(e => e.Id == id);
}

