using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaymentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPayments([FromQuery] int? clientId, [FromQuery] string? status)
    {
        var query = _context.Payments
            .Include(p => p.Client)
            .AsQueryable();

        if (clientId.HasValue)
            query = query.Where(p => p.ClientId == clientId.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        return await query.OrderByDescending(p => p.PaymentDate).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetPayment(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null) return NotFound();
        return payment;
    }

    [HttpPost]
    public async Task<ActionResult<Payment>> CreatePayment(Payment payment)
    {
        // Generate payment code if not provided
        if (string.IsNullOrEmpty(payment.PaymentCode))
        {
            payment.PaymentCode = $"PAY{DateTime.UtcNow:yyyyMMddHHmmss}";
        }

        payment.PaymentDate = DateTime.UtcNow;
        payment.CreatedAt = DateTime.UtcNow;

        // Update status based on due date
        if (payment.DueDate < DateTime.UtcNow && payment.Status == "Pending")
        {
            payment.Status = "Overdue";
        }

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(int id, Payment payment)
    {
        if (id != payment.Id) return BadRequest();
        
        _context.Entry(payment).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PaymentExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null) return NotFound();
        
        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetOverduePayments()
    {
        var overduePayments = await _context.Payments
            .Include(p => p.Client)
            .Where(p => p.Status == "Overdue" || (p.DueDate < DateTime.UtcNow && p.Status == "Pending"))
            .OrderBy(p => p.DueDate)
            .ToListAsync();

        return overduePayments;
    }

    private bool PaymentExists(int id) => _context.Payments.Any(e => e.Id == id);
}

