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
        internal Settings Settings;

        internal BaseApiController(ApplicationDbContext applicationDbContext, UserManager<User> userManager, Settings settings)
        {
            db = applicationDbContext;
            this.userManager = userManager;
            this.Settings = settings;
            //Task.Delay(2000).Wait();
            //    // added this to force the user to load before any other calls, else there were errors that an async call was already being made...
            //CurrentUser = UserManager.FindByName(User.Identity.Name);
            //CurrentUser = (await um.GetUserAsync(HttpContext.User).Wait();
            //CurrentUser = Task.Run(() => um.GetUserAsync(HttpContext.User)).Wait();
            //User.FindFirst(ClaimTypes.NameIdentifier).Value
        }

        //internal Settings Settings
        //{
        //    get
        //    {
        //        if (_settings == null) _settings = new Settings(db);
        //        return _settings;
        //    }
        //}
        //internal User CurrentUser
        //{
        //    get
        //    {
        //        if (_currentUser == null) _currentUser = UserManager.FindByName(User.Identity.Name);
        //        return _currentUser;
        //    }
        //}
        //internal ModelFactory ModelFactory
        //{
        //    get
        //    {
        //        if (_modelFactory == null) _modelFactory = new ModelFactory();
        //        return _modelFactory;
        //    }
        //}
        //internal AppUserManager UserManager
        //{
        //    get
        //    {
        //        if (_userManager == null) _userManager = HttpContext.Current.GetOwinContext().GetUserManager<AppUserManager>();
        //        return _userManager;
        //    }
        //}
        //private Settings _settings;
        //private User _currentUser;
        //private ModelFactory _modelFactory;
        //private AppUserManager _userManager;

        //internal bool CurrentUserIsInRole(Roles role)
        //{
        //    return UserManager.IsInRole(CurrentUser.Id, role.ToString());
        //}

        //public BaseApiController() : base()
        //{
        //    // added this to force the user to load before any other calls, else there were errors that an async call was already being made...
        //    _currentUser = UserManager.FindByName(User.Identity.Name);
        //}

        protected async Task<List<T>> GetPaginatedResponse<T>(IQueryable<T> query, PagingOptions pagingOptions)
        {
            if (pagingOptions == null) pagingOptions = new PagingOptions();
            if (pagingOptions.PageIndex < 0) pagingOptions.PageIndex = 0;

            var totalRecords = query.Count();
            var totalPages = (int)Math.Ceiling((double)totalRecords / pagingOptions.PageSize);

            var results = await (pagingOptions.PageSize <= 0
                ? query.ToListAsync()
                : query.Skip(pagingOptions.PageSize * pagingOptions.PageIndex)
                    .Take(pagingOptions.PageSize)
                    .ToListAsync());

            var paginationHeader = new
            {
                pageIndex = pagingOptions.PageIndex,
                pageSize = pagingOptions.PageSize,
                records = results.Count,
                totalRecords = totalRecords,
                totalPages = totalPages,
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

        //protected ResponseMessageResult Forbidden()
        //{
        //    return ResponseMessage(new HttpResponseMessage(HttpStatusCode.Forbidden));
        //}

        //protected BadRequestObjectResult BadRequest(ModelStateDictionary ModelState, string key, string error)
        //{
        //    ModelState.AddModelError(key, error);
        //    return BadRequest(ModelState);
        //}
    }

    public class AuthorizeRolesAttribute : AuthorizeAttribute
    {
        public AuthorizeRolesAttribute(params Roles[] roles) : base()
        {
            Roles = string.Join(",", roles.Select(r => r.ToString()));
        }
    }

    public class PagingOptions
    {
        public PagingOptions()
        {
            PageIndex = 0;
            PageSize = 10;
            OrderBy = null;
            OrderByAscending = true;
        }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string OrderBy { get; set; }
        public bool OrderByAscending { get; set; }
        public bool IncludeEntities { get; set; } = false;
    }

    //public class BadRequestErrors : IHttpActionResult
    //{
    //    private List<string> messages;
    //    private HttpRequestMessage request;

    //    public BadRequestErrors(List<string> messages, HttpRequestMessage request)
    //    {
    //        this.messages = messages;
    //        this.request = request;
    //    }

    //    public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
    //    {
    //        var response = request.CreateResponse(HttpStatusCode.BadRequest, messages);
    //        return Task.FromResult(response);
    //    }
    //}
}