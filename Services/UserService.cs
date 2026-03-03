using System;
using System.Collections.Generic;
using System.Linq;
using FormulariosAPI.Data;
using FormulariosAPI.DTOs;
using FormulariosAPI.Models;
using FormulariosAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FormulariosAPI.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<UserDto> GetAll()
        {
            return _context.Users
                .Include(u => u.Area)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    AreaId = u.AreaId,
                    AreaName = u.Area != null ? u.Area.Name : null
                })
                .ToList();
        }

        public UserDto? Create(CreateUserDto dto)
        {
            if (_context.Users.Any(u => u.Username == dto.Username))
                return null;

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

            // Reload with area
            var area = dto.AreaId.HasValue ? _context.Areas.Find(dto.AreaId.Value) : null;

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                AreaId = user.AreaId,
                AreaName = area?.Name
            };
        }

        public bool Delete(Guid id)
        {
            var user = _context.Users.Find(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            _context.SaveChanges();
            return true;
        }
    }
}
