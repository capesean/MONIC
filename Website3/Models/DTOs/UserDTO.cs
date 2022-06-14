using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;

namespace WEB.Models
{
    public class UserDTO
    {
        [Required]
        public Guid Id { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string FirstName { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string LastName { get; set; }

        public string FullName { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(256)]
        public string Email { get; set; }

        [Required]
        public bool Disabled { get; set; }

        public IList<string> Roles { get; set; }

    }

    public static partial class ModelFactory
    {
        public static UserDTO Create(User user, List<Role> dbRoles = null)
        {
            if (user == null) return null;

            var userRoles = new List<string>();
            if (user.Roles != null && dbRoles != null)
                userRoles = dbRoles.Where(o => user.Roles.Any(r => r.RoleId == o.Id)).Select(o => o.Name).ToList();

            var userDTO = new UserDTO();

            userDTO.Id = user.Id;
            userDTO.FirstName = user.FirstName;
            userDTO.LastName = user.LastName;
            userDTO.FullName = user.FullName;
            userDTO.Email = user.Email;
            userDTO.Disabled = user.Disabled;
            userDTO.Roles = userRoles;

            return userDTO;
        }

        public static void Hydrate(User user, UserDTO userDTO)
        {
            user.UserName = userDTO.Email;
            user.FirstName = userDTO.FirstName;
            user.LastName = userDTO.LastName;
            user.Email = userDTO.Email;
            user.Disabled = userDTO.Disabled;
        }
    }
}
