using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EmployeesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees([FromQuery] int? serviceId, [FromQuery] int? departmentId)
    {
        var query = _context.Employees
            .Include(e => e.Service)
            .Include(e => e.Department)
            .AsQueryable();

        if (serviceId.HasValue)
            query = query.Where(e => e.ServiceId == serviceId.Value);

        if (departmentId.HasValue)
            query = query.Where(e => e.DepartmentId == departmentId.Value);

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Service)
            .Include(e => e.Department)
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (employee == null) return NotFound();
        return employee;
    }

    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
    {
        // Generate employee code if not provided
        if (string.IsNullOrEmpty(employee.EmployeeCode))
        {
            employee.EmployeeCode = $"EMP{DateTime.UtcNow:yyyyMMddHHmmss}";
        }

        employee.CreatedAt = DateTime.UtcNow;
        employee.HireDate = DateTime.UtcNow;
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
    {
        if (id != employee.Id) return BadRequest();
        
        _context.Entry(employee).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EmployeeExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();
        
        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool EmployeeExists(int id) => _context.Employees.Any(e => e.Id == id);
}

