using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace WEB.Models
{
    public partial class User : IdentityUser<Guid>
    {
        public ICollection<IdentityUserRole<Guid>> Roles { get; set; }
    }

    public class AppUserLogin : IdentityUserLogin<Guid> { }

    public class AppUserRole : IdentityUserRole<Guid> { }

    public class AppUserClaim : IdentityUserClaim<Guid> { }

    public class AppRole : IdentityRole<Guid> { }

    public class AppClaimsPrincipal : ClaimsPrincipal
    {
        public AppClaimsPrincipal(ClaimsPrincipal principal) : base(principal)
        { }

        public Guid UserId
        {
            get { return Guid.Parse(this.FindFirst(ClaimTypes.Sid).Value); }
        }
    }

}