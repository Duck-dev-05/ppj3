using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Client>>> GetClients([FromQuery] string? search)
    {
        var query = _context.Clients.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(c =>
                c.CompanyName.ToLower().Contains(search) ||
                c.ContactPerson.ToLower().Contains(search) ||
                c.Email.ToLower().Contains(search) ||
                c.ClientCode.ToLower().Contains(search) ||
                c.Phone.Contains(search)
            );
        }

        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    [HttpGet("advanced-search")]
    public async Task<ActionResult<IEnumerable<Client>>> AdvancedSearch(
        [FromQuery] string? companyName,
        [FromQuery] string? email,
        [FromQuery] string? city,
        [FromQuery] string? country,
        [FromQuery] bool? isActive)
    {
        var query = _context.Clients.AsQueryable();

        if (!string.IsNullOrEmpty(companyName))
            query = query.Where(c => c.CompanyName.ToLower().Contains(companyName.ToLower()));

        if (!string.IsNullOrEmpty(email))
            query = query.Where(c => c.Email.ToLower().Contains(email.ToLower()));

        if (!string.IsNullOrEmpty(city))
            query = query.Where(c => c.City.ToLower().Contains(city.ToLower()));

        if (!string.IsNullOrEmpty(country))
            query = query.Where(c => c.Country.ToLower().Contains(country.ToLower()));

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Client>> GetClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();
        return client;
    }

    [HttpPost]
    public async Task<ActionResult<Client>> CreateClient(Client client)
    {
        // Validate model
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Ignore the ID from request body - let EF Core auto-generate it
        client.Id = 0;

        // Check if email already exists
        if (await _context.Clients.AnyAsync(c => c.Email.ToLower() == client.Email.ToLower()))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        // Generate client code if not provided
        if (string.IsNullOrEmpty(client.ClientCode))
        {
            client.ClientCode = $"CLT{DateTime.UtcNow:yyyyMMddHHmmss}";
        }

        client.CreatedAt = DateTime.UtcNow;
        _context.Clients.Add(client);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new { message = "Error saving client: " + ex.Message });
        }
        
        // EF Core automatically populates the ID after SaveChangesAsync
        // Return the created client using CreatedAtAction (REST standard)
        return CreatedAtAction(nameof(GetClient), new { id = client.Id }, client);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClient(int id, Client client)
    {
        if (id != client.Id) return BadRequest();
        
        _context.Entry(client).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ClientExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);
        if (client == null) return NotFound();
        
        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool ClientExists(int id) => _context.Clients.Any(e => e.Id == id);
}

