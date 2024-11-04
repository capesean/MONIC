using WEB.Models;

public interface IIdentityService
{
    bool UserIsInRole(Roles role);
    bool UserIsInAnyRole(params Roles[] roles);
}

public class IdentityService : IIdentityService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public IdentityService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool UserIsInRole(Roles role)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user != null && user.IsInRole(role.ToString());
    }

    public bool UserIsInAnyRole(params Roles[] roles)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user != null && roles.Any(role => user.IsInRole(role.ToString()));
    }
}