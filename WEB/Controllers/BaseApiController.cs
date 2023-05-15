using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Validation.AspNetCore;
using WEB.Models;

namespace WEB.Controllers
{
    [ApiController, Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    public class BaseApiController : ControllerBase
    {
        internal ApplicationDbContext db;
        internal UserManager<User> userManager;
        private User _user;
        internal User CurrentUser
        {
            get
            {
                if (_user == null)
                {
                    _user = db.Users
                        .Include(o => o.Roles)
                        .FirstOrDefault(o => o.UserName == User.Identity.Name);
                }
                return _user;
            }

        }
        internal AppSettings AppSettings;

        internal BaseApiController(ApplicationDbContext applicationDbContext, UserManager<User> userManager, AppSettings appSettings)
        {
            db = applicationDbContext;
            this.userManager = userManager;
            AppSettings = appSettings;
        }

        internal async Task<bool> CurrentUserIsInRoleAsync(Roles role)
        {
            return await userManager.IsInRoleAsync(CurrentUser, role.ToString());
        }

        protected async Task<List<T>> GetPaginatedResponse<T>(IQueryable<T> query, SearchOptions pagingOptions)
        {
            if (pagingOptions == null) pagingOptions = new SearchOptions();
            if (pagingOptions.PageIndex < 0) pagingOptions.PageIndex = 0;

            var totalRecords = query.Count();
            var totalPages = pagingOptions.PageSize == 0 ? (totalRecords == 0 ? 0 : 1) : (int)Math.Ceiling((double)totalRecords / pagingOptions.PageSize);

            var results = await (pagingOptions.PageSize <= 0
                ? query.ToListAsync()
                : query.Skip(pagingOptions.PageSize * pagingOptions.PageIndex)
                    .Take(pagingOptions.PageSize)
                    .ToListAsync());

            var paginationHeader = new
            {
                pagingOptions.PageIndex,
                pagingOptions.PageSize,
                records = results.Count,
                totalRecords,
                totalPages,
                first = pagingOptions.PageIndex * pagingOptions.PageSize
            };

            HttpContext.Response.Headers.Add("X-Pagination", Newtonsoft.Json.JsonConvert.SerializeObject(paginationHeader));

            return results;
        }

        protected IActionResult GetErrorResult(IdentityResult result)
        {
            if (result == null)
            {
                return BadRequest();
            }

            if (!result.Succeeded)
            {
                if (result.Errors != null)
                {
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                }

                if (ModelState.IsValid)
                {
                    // No ModelState errors are available to send, so just return an empty BadRequest.
                    return BadRequest();
                }

                return BadRequest(ModelState);
            }

            return null;
        }
    }

    public class AuthorizeRolesAttribute : AuthorizeAttribute
    {
        public AuthorizeRolesAttribute(params Roles[] roles) : base()
        {
            Roles = string.Join(",", roles.Select(r => r.ToString()));
            if (!roles.Contains(Models.Roles.Administrator)) Roles += ",Administrator";
        }
    }

}