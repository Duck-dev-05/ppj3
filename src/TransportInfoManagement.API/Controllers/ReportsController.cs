using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;

namespace TransportInfoManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("clients-by-service/{serviceId}")]
    public async Task<ActionResult<object>> GetClientsByService(int serviceId)
    {
        var clients = await _context.ClientServices
            .Include(cs => cs.Client)
            .Include(cs => cs.Service)
            .Where(cs => cs.ServiceId == serviceId && cs.IsActive)
            .Select(cs => new
            {
                cs.Client!.Id,
                cs.Client.CompanyName,
                cs.Client.ContactPerson,
                cs.Client.Email,
                cs.Client.Phone,
                ServiceName = cs.Service!.Name,
                cs.StartDate,
                cs.EndDate,
                cs.NumberOfEmployees
            })
            .ToListAsync();

        return Ok(clients);
    }

    [HttpGet("employees-by-service/{serviceId}")]
    public async Task<ActionResult<object>> GetEmployeesByService(int serviceId)
    {
        var employees = await _context.Employees
            .Include(e => e.Service)
            .Include(e => e.Department)
            .Where(e => e.ServiceId == serviceId && e.IsActive)
            .Select(e => new
            {
                e.Id,
                e.EmployeeCode,
                e.FullName,
                e.Email,
                e.Phone,
                e.Position,
                ServiceName = e.Service!.Name,
                DepartmentName = e.Department!.Name,
                e.HireDate
            })
            .ToListAsync();

        return Ok(employees);
    }

    [HttpGet("payments")]
    public async Task<ActionResult<object>> GetPaymentsReport(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? status)
    {
        var query = _context.Payments
            .Include(p => p.Client)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(p => p.PaymentDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(p => p.PaymentDate <= endDate.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        var payments = await query
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new
            {
                p.Id,
                p.PaymentCode,
                ClientName = p.Client!.CompanyName,
                p.Amount,
                p.PaymentDate,
                p.DueDate,
                p.Status,
                p.PaymentMethod
            })
            .ToListAsync();

        var summary = new
        {
            TotalPayments = payments.Count,
            TotalAmount = payments.Sum(p => p.Amount),
            PaidAmount = payments.Where(p => p.Status == "Paid").Sum(p => p.Amount),
            PendingAmount = payments.Where(p => p.Status == "Pending").Sum(p => p.Amount),
            OverdueAmount = payments.Where(p => p.Status == "Overdue").Sum(p => p.Amount),
            Payments = payments
        };

        return Ok(summary);
    }

    [HttpGet("overdue-payments")]
    public async Task<ActionResult<object>> GetOverduePaymentsReport()
    {
        var overduePayments = await _context.Payments
            .Include(p => p.Client)
            .Where(p => p.Status == "Overdue" || (p.DueDate < DateTime.UtcNow && p.Status == "Pending"))
            .OrderBy(p => p.DueDate)
            .Select(p => new
            {
                p.Id,
                p.PaymentCode,
                ClientName = p.Client!.CompanyName,
                ClientEmail = p.Client.Email,
                ClientPhone = p.Client.Phone,
                p.Amount,
                p.DueDate,
                DaysOverdue = (DateTime.UtcNow - p.DueDate).Days,
                p.Status
            })
            .ToListAsync();

        return Ok(new
        {
            TotalOverdue = overduePayments.Count,
            TotalAmount = overduePayments.Sum(p => p.Amount),
            Payments = overduePayments
        });
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        var totalClients = await _context.Clients.CountAsync();
        var activeClients = await _context.Clients.CountAsync(c => c.IsActive);
        var totalEmployees = await _context.Employees.CountAsync();
        var activeEmployees = await _context.Employees.CountAsync(e => e.IsActive);
        var totalServices = await _context.Services.CountAsync();
        var activeServices = await _context.Services.CountAsync(s => s.IsActive);
        var totalPayments = await _context.Payments.CountAsync();
        var pendingPayments = await _context.Payments.CountAsync(p => p.Status == "Pending");
        var overduePayments = await _context.Payments.CountAsync(p => p.Status == "Overdue");
        var totalRevenue = await _context.Payments
            .Where(p => p.Status == "Paid")
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        return Ok(new
        {
            Clients = new { Total = totalClients, Active = activeClients },
            Employees = new { Total = totalEmployees, Active = activeEmployees },
            Services = new { Total = totalServices, Active = activeServices },
            Payments = new { Total = totalPayments, Pending = pendingPayments, Overdue = overduePayments },
            TotalRevenue = totalRevenue
        });
    }
}

