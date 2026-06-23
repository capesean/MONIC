using System.ComponentModel.DataAnnotations;

namespace Monic.Web.Models
{
    public class SetupDTO
    {
        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(100)]
        public string FirstName { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(100)]
        public string LastName { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }
    }
}
