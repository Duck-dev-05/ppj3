namespace TransportInfoManagement.API.Models;

public class Service
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ServiceFee
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public Service? Service { get; set; }
    public decimal FeePerDayPerEmployee { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

