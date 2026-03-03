using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using FormulariosAPI.Data;
using FormulariosAPI.DTOs.Auth;
using FormulariosAPI.Models;
using FormulariosAPI.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FormulariosAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public string? Login(LoginDto dto)
        {
            // Seed default admin if no users exist
            if (!_context.Users.Any())
            {
                _context.Users.Add(new User 
                { 
                    Id = Guid.NewGuid(), 
                    Username = "admin",
                    Email = "admin@formforge.com", 
                    PasswordHash = "123456",
                    Role = "Admin"
                });
                _context.SaveChanges();
            }

            var user = _context.Users.FirstOrDefault(u => u.Username == dto.Username && u.PasswordHash == dto.Password);
            if (user == null) return null;

            return GenerateJwtToken(user);
        }

        public bool Register(RegisterDto dto)
        {
            if (_context.Users.Any(u => u.Username == dto.Username)) return false;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = dto.Password,
                Role = dto.Role,
                AreaId = dto.AreaId
            };
            
            _context.Users.Add(user);
            _context.SaveChanges();
            
            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "ClaveSuperSecretaDePrueba1234567890!!";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "MyAppAPI";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "MyAppClients";

            var key = Encoding.UTF8.GetBytes(jwtKey);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("username", user.Username)
            };

            if (user.AreaId.HasValue)
            {
                claims.Add(new Claim("AreaId", user.AreaId.Value.ToString()));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
