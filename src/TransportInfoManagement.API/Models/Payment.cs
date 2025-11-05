namespace TransportInfoManagement.API.Models;

public class Payment
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public Client? Client { get; set; }
    public string PaymentCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // Cash, Bank Transfer, Credit Card
    public string Status { get; set; } = "Pending"; // Pending, Paid, Overdue
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

