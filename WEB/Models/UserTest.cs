using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WEB.Models
{
    public class UserTest
    {
        [Key, Required]
        public Guid UserTestId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required(AllowEmptyStrings = true), MaxLength(50)]
        public string Name { get; set; }

        [Required]
        public int SortOrder { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public UserTest()
        {
            UserTestId = Guid.NewGuid();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
