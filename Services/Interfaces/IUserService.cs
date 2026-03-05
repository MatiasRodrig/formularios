using System;
using System.Collections.Generic;
using FormulariosAPI.DTOs;

namespace FormulariosAPI.Services.Interfaces
{
    public interface IUserService
    {
        IEnumerable<UserDto> GetAll();
        UserDto? Create(CreateUserDto dto);
        bool Delete(Guid id);
        bool UpdatePassword(Guid userId, string newPassword);
        bool UpdateRoleArea(Guid userId, string? role, Guid? areaId);
    }
}
