namespace TransportInfoManagement.API.Models;

public class ClientService
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public Client? Client { get; set; }
    public int ServiceId { get; set; }
    public Service? Service { get; set; }
    public int? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public int NumberOfEmployees { get; set; } = 1;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

