using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    string GenerateJwtToken(User user);
}

