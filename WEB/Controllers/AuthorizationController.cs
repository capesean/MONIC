using System.Net;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OpenIddict.Abstractions;
using WEB;
using WEB.Controllers;
using WEB.Models;
using OpenIddict.Server.AspNetCore;
using Microsoft.AspNetCore;
using static OpenIddict.Abstractions.OpenIddictConstants;
using OpenIddict.Validation.AspNetCore;
using WEB.Models.Authorization;

namespace AuthorizationServer.Controllers
{
    [Route("api/[Controller]")]
    public class AuthorizationController : BaseApiController
    {
        private IOptions<IdentityOptions> opts;
        private readonly SignInManager<User> signInManager;
        private IEmailSender emailSender;

        public AuthorizationController(
            IDbContextFactory<ApplicationDbContext> dbFactory,
            UserManager<User> _um,
            AppSettings _appSettings,
            SignInManager<User> _sm,
            IEmailSender _es,
            IOptions<IdentityOptions> _opts)
            : base(dbFactory, _um, _appSettings)
        {
            signInManager = _sm;
            emailSender = _es;
            opts = _opts;
        }

        [HttpPost("~/connect/token"), Produces("application/json"), AllowAnonymous]
        public async Task<IActionResult> Exchange()
        {
            var request = HttpContext.GetOpenIddictServerRequest() ??
                throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

            if (request.IsPasswordGrantType())
            {
                var user = await userManager.FindByNameAsync(request.Username);
                if (user == null)
                {
                    return Forbid(
                       authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                       properties: new AuthenticationProperties(new Dictionary<string, string>
                       {
                           [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                           [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The login details are invalid."
                       }));
                }

                if (user.Disabled || user.LockoutEnd > DateTime.UtcNow)
                {
                    return Forbid(
                       authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                       properties: new AuthenticationProperties(new Dictionary<string, string>
                       {
                           [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.AccessDenied,
                           [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The user has been disabled."
                       }));
                }

                // validate the userName/password parameters and ensure the account is not locked out.
                var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
                if (!result.Succeeded)
                {
                    return Forbid(
                       authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                       properties: new AuthenticationProperties(new Dictionary<string, string>
                       {
                           [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                           [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The login details are invalid."
                       }));
                }

                var principal = await signInManager.CreateUserPrincipalAsync(user);

                // set any custom claims here
                //((ClaimsIdentity)principal.Identity).AddClaim(
                //    new Claim(
                //        "xxx",
                //        user.xxx.ToString(),
                //        ClaimValueTypes.String,
                //        OpenIddictServerAspNetCoreDefaults.AuthenticationScheme
                //        )
                //    );

                principal.SetScopes(new[]
                {
                    Scopes.OpenId,
                    Scopes.Email,
                    Scopes.Profile,
                    Scopes.OfflineAccess,
                    Scopes.Roles
                }.Intersect(request.GetScopes()));

                // any custom fields...
                //user.LastLoginDateUTC = DateTime.UtcNow;
                //await userManager.UpdateAsync(user);

                foreach (var claim in principal.Claims)
                {
                    claim.SetDestinations(GetDestinations(claim, principal));
                }

                // Returning a SignInResult will ask OpenIddict to issue the appropriate access/identity tokens.
                return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            }

            else if (request.IsRefreshTokenGrantType())
            {
                // Retrieve the claims principal stored in the refresh token.
                var principal = (await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme)).Principal;

                // Retrieve the user profile corresponding to the refresh token.
                // Note: if you want to automatically invalidate the refresh token
                // when the user password/roles change, use the following line instead:
                // var user = _signInManager.ValidateSecurityStampAsync(info.Principal);
                var user = await userManager.GetUserAsync(principal);
                if (user is null)
                {
                    return Forbid(
                        authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                        properties: new AuthenticationProperties(new Dictionary<string, string>
                        {
                            [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The token is no longer valid."
                        }));
                }

                if (user.Disabled || user.LockoutEnd > DateTime.UtcNow)
                {
                    return Forbid(
                       authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                       properties: new AuthenticationProperties(new Dictionary<string, string>
                       {
                           [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.AccessDenied,
                           [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The user has been disabled."
                       }));
                }

                // Ensure the user is still allowed to sign in.
                if (!await signInManager.CanSignInAsync(user))
                {
                    return Forbid(
                        authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                        properties: new AuthenticationProperties(new Dictionary<string, string>
                        {
                            [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The user is no longer allowed to sign in."
                        }));
                }

                foreach (var claim in principal.Claims)
                {
                    claim.SetDestinations(GetDestinations(claim, principal));
                }

                // Returning a SignInResult will ask OpenIddict to issue the appropriate access/identity tokens.
                return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            }

            throw new InvalidOperationException("The specified grant type is not supported.");
        }

        [HttpGet, Route("profile")]
        public async Task<IActionResult> Profile()
        {
            // add properties to profile as needed
            var roleIds = CurrentUser.Roles.Select(o => o.RoleId).ToArray();

            var roleNames = await db.Roles
                .Where(o => roleIds.Contains(o.Id))
                .Select(o => o.Name)
                .ToListAsync();

            var profile = new ProfileModel
            {
                Email = CurrentUser.Email,
                FirstName = CurrentUser.FirstName,
                LastName = CurrentUser.LastName,
                FullName = CurrentUser.FullName,
                UserId = CurrentUser.Id,
                UserName = CurrentUser.UserName
            };

            return Ok(profile);
        }

        private IEnumerable<string> GetDestinations(Claim claim, System.Security.Claims.ClaimsPrincipal principal)
        {
            // Note: by default, claims are NOT automatically included in the access and identity tokens.
            // To allow OpenIddict to serialize them, you must attach them a destination, that specifies
            // whether they should be included in access tokens, in identity tokens or in both.

            switch (claim.Type)
            {
                case Claims.Name:
                    yield return Destinations.AccessToken;

                    if (principal.HasScope(Scopes.Profile))
                        yield return Destinations.IdentityToken;

                    yield break;

                case Claims.Email:
                    yield return Destinations.AccessToken;

                    if (principal.HasScope(Scopes.Email))
                        yield return Destinations.IdentityToken;

                    yield break;

                case Claims.Role:
                    yield return Destinations.AccessToken;

                    if (principal.HasScope(Scopes.Roles))
                        yield return Destinations.IdentityToken;

                    yield break;

                // Never include the security stamp in the access and identity tokens, as it's a secret value.
                case "AspNet.Identity.SecurityStamp": yield break;

                default:
                    yield return Destinations.AccessToken;
                    yield break;
            }
        }

        [HttpPost("[Action]"), Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO changePasswordDTO)
        {
            // todo: check if enabled? user.enabled - also in login, reset, BaseApiController, etc.
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (changePasswordDTO.NewPassword != changePasswordDTO.ConfirmPassword) return BadRequest("Passwords do not match");

            var user = await db.Users.FirstOrDefaultAsync(o => o.UserName == User.Identity.Name);
            if (user == null) return NotFound();

            var result = await userManager.ChangePasswordAsync(user, changePasswordDTO.CurrentPassword, changePasswordDTO.NewPassword);

            if (!result.Succeeded) return BadRequest(result.Errors.First().Description);

            var body = user.FirstName + Environment.NewLine;
            body += Environment.NewLine;
            body += "Your password has been changed." + Environment.NewLine;

            await emailSender.SendEmailAsync(user.Email, user.FullName, "Password Changed", body);

            return Ok();
        }

        [HttpPost("[Action]"), AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetPasswordDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await db.Users.FirstOrDefaultAsync(o => o.UserName == resetPasswordDTO.UserName);
            if (user == null) return BadRequest("Invalid email");

            var token = await userManager.GeneratePasswordResetTokenAsync(user);

            var text = user.FirstName + Environment.NewLine;
            text += Environment.NewLine;
            text += "A password reset has been requested. Please use the link below to reset your password." + Environment.NewLine;
            text += Environment.NewLine;
            text += AppSettings.RootUrl + "auth/reset?e=" + user.Email + "&t=" + token + Environment.NewLine;

            var html = user.FirstName + Environment.NewLine;
            html += Environment.NewLine;
            html += "A password reset has been requested. Please use the link below to reset your password." + Environment.NewLine;
            html += Environment.NewLine;
            html += AppSettings.RootUrl + "auth/reset?e=" + user.Email + "&t=" + WebUtility.UrlEncode(token) + Environment.NewLine;

            await emailSender.SendEmailAsync(user.Email, user.FullName, "Password Reset", text, html);

            return Ok();
        }

        [HttpPost("[Action]"), AllowAnonymous]
        public async Task<IActionResult> Reset([FromBody] ResetDTO resetDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (resetDTO.NewPassword != resetDTO.ConfirmPassword) return BadRequest("Passwords do not match");

            var user = await db.Users.FirstOrDefaultAsync(o => o.UserName == resetDTO.UserName);
            if (user == null) return BadRequest("Invalid email");

            var result = await userManager.ResetPasswordAsync(user, resetDTO.Token, resetDTO.NewPassword);

            if (!result.Succeeded) return BadRequest(result.Errors.First().Description);

            var body = user.FirstName + Environment.NewLine;
            body += Environment.NewLine;
            body += "Your password has been reset." + Environment.NewLine;

            await emailSender.SendEmailAsync(user.Email, user.FullName, "Password Reset", body);

            return Ok();
        }

        [HttpGet("[Action]")]
        public IActionResult PasswordRequirements()
        {
            return Ok(opts.Value.Password);
        }

    }
}