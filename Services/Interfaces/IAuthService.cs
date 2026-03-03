using System;
using FormulariosAPI.DTOs.Auth;

namespace FormulariosAPI.Services.Interfaces
{
    public interface IAuthService
    {
        string? Login(LoginDto dto);
        bool Register(RegisterDto dto);
    }
}
