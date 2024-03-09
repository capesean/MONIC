using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace WEB.Models
{
    public partial class User : IdentityUser<Guid>
    {
        public ICollection<IdentityUserRole<Guid>> Roles { get; set; }
    }

    public class UserLogin : IdentityUserLogin<Guid> { }

    public class UserRole : IdentityUserRole<Guid> { }

    public class UserClaim : IdentityUserClaim<Guid> { }

    public class Role : IdentityRole<Guid> { }

}