using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class UserTestDTO
    {
        [Required]
        public Guid UserTestId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string Name { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public UserDTO User { get; set; }

    }

    public static partial class ModelFactory
    {
        public static UserTestDTO Create(UserTest userTest, bool includeParents = true, bool includeChildren = false)
        {
            if (userTest == null) return null;

            var userTestDTO = new UserTestDTO();

            userTestDTO.UserTestId = userTest.UserTestId;
            userTestDTO.UserId = userTest.UserId;
            userTestDTO.Name = userTest.Name;
            userTestDTO.SortOrder = userTest.SortOrder;

            if (includeParents)
            {
                userTestDTO.User = Create(userTest.User);
            }

            return userTestDTO;
        }

        public static void Hydrate(UserTest userTest, UserTestDTO userTestDTO)
        {
            userTest.UserId = userTestDTO.UserId;
            userTest.Name = userTestDTO.Name;
            userTest.SortOrder = userTestDTO.SortOrder;
        }
    }
}
