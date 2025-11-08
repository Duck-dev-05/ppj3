using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    string GenerateJwtToken(User user);
}

