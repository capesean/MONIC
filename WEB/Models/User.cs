using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public partial class User
    {
        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string FirstName { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string LastName { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed), Required(AllowEmptyStrings = true), MaxLength(250)]
        public string FullName { get; private set; }

        [Required]
        public bool Disabled { get; set; }

        public User()
        {
            Id = Guid.NewGuid();
        }

        public override string ToString()
        {
            return FullName;
        }

        public override bool Equals(object obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;

            User other = (User)obj;

            return Id == other.Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }
    }
}
