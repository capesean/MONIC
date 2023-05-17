using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RolesEnums = WEB.Models.Roles;

namespace WEB.Models
{
    public class AppUser
    {
        #region properties
        public bool IsLoggedIn { get { return _user != null; } }
        public Guid Id { get { return _user.Id; } }
        public string Email { get { return _user.Email; } }
        public string UserName { get { return _user.UserName; } }
        public string FullName { get { return _user.FullName; } }
        public string FirstName { get { return _user.FirstName; } }
        public string LastName { get { return _user.LastName; } }
        public bool Disabled { get { return _user.Disabled; } }
        public Guid? OrganisationId { get { return _user.OrganisationId; } }
        public Organisation Organisation { get { return _user.Organisation; } }
        // todo: remove this?
        public Guid? AffiliatedEntityId { get { return _user.AffiliatedEntityId; } }
        public string DashboardSettings { get { return _user.DashboardSettings; } }

        private readonly ApplicationDbContext _db;
        private readonly User _user;
        private readonly UserManager<User> userManager;

        public ICollection<IdentityUserRole<Guid>> Roles { get { return _user.Roles; } }

        private Dictionary<Guid, IndicatorPermission> _indicatorPermissions;
        private Dictionary<Guid, IndicatorPermission> indicatorPermissions
        {
            get
            {
                if (_indicatorPermissions == null)
                {
                    LoadIndicatorPermissions();
                }
                return _indicatorPermissions;
            }
        }

        private Dictionary<Guid, EntityPermission> _entityPermissions;
        private Dictionary<Guid, EntityPermission> entityPermissions
        {
            get
            {
                if (_entityPermissions == null)
                {
                    _entityPermissions = _db.EntityPermissions.Where(o => o.UserId == _user.Id).ToDictionary(o => o.EntityId);
                }
                return _entityPermissions;
            }
        }

        private HashSet<string> _roles = null;
        private HashSet<string> roles
        {
            get
            {
                if (_roles == null)
                {
                    if (_user == null)
                        _roles = new HashSet<string>();
                    else
                        _roles = userManager.GetRolesAsync(_user)
                            .Result
                            .Select(o => o)
                            .ToHashSet();
                }
                return _roles;
            }
        }
        #endregion

        public AppUser(ApplicationDbContext db, User user, UserManager<User> userManager)
        {
            _db = db;
            _user = user;
            this.userManager = userManager;
        }

        public bool IsInRole(Roles role)
        {
            if (roles.Contains(role.ToString())) return true;
            return roles.Contains(RolesEnums.Administrator.ToString());
        }

        public bool HasIndicatorPermission(PermissionType permissionType, Guid indicatorId)
        {
            if (IsInRole(RolesEnums.Administrator)) return true;

            if (permissionType == PermissionType.View)
            {
                // if user is an organisation manager
                if (userManager.IsInRoleAsync(_user, RolesEnums.Manager.ToString()).Result)
                {
                    // organisation managers can view all indicators, so return true; 
                    return true;
                }
            }

            // get the indicator & the global permission
            indicatorPermissions.TryGetValue(indicatorId, out var indicatorPermission);
            indicatorPermissions.TryGetValue(Guid.Empty, out var globalIndicatorPermission);

            if (permissionType == PermissionType.View) return indicatorPermission != null || globalIndicatorPermission != null;
            if (permissionType == PermissionType.Edit) return indicatorPermission?.Edit == true || globalIndicatorPermission?.Edit == true;
            if (permissionType == PermissionType.Submit) return indicatorPermission?.Submit == true || globalIndicatorPermission?.Submit == true;
            if (permissionType == PermissionType.Verify) return indicatorPermission?.Verify == true || globalIndicatorPermission?.Verify == true;
            if (permissionType == PermissionType.Approve) return indicatorPermission?.Approve == true || globalIndicatorPermission?.Approve == true;

            return false;

        }

        public bool HasEntityPermission(Guid entityId)
        {
            if (IsInRole(RolesEnums.Administrator)) return true;

            return entityPermissions.ContainsKey(entityId);
        }

        public Guid[] GetPermittedEntityIds()
        {
            if (IsInRole(RolesEnums.Administrator)) return _db.Entities.Select(o => o.EntityId).ToArray();
            return entityPermissions.Values.Select(o => o.EntityId).ToArray();
        }

        private void LoadIndicatorPermissions(bool includeEntities = false)
        {
            var indicatorPermissionsQuery = _db.IndicatorPermissions
                .Where(p => p.UserId == _user.Id);

            if (includeEntities) indicatorPermissionsQuery = indicatorPermissionsQuery.Include(o => o.Indicator.Subcategory.Category);

            indicatorPermissionsQuery = indicatorPermissionsQuery.OrderBy(o => o.Indicator.Subcategory.Category.SortOrder)
                .ThenBy(o => o.Indicator.Subcategory.SortOrder)
                .ThenBy(o => o.Indicator.SortOrder);

            // use Guid.empty as 'all indicators' key
            _indicatorPermissions = indicatorPermissionsQuery.ToDictionary(o => o.IndicatorId ?? Guid.Empty);
        }

        public IQueryable<Indicator> GetPermittedIndicatorsQuery(PermissionType permissionType = PermissionType.View, bool includeEntities = false)
        {
            IQueryable<Indicator> indicatorQuery = _db.Indicators;

            // admins & managers have access to all indicators
            if (!IsInRole(RolesEnums.Administrator) && !IsInRole(RolesEnums.Manager))
            {
                // retrieve the global permission for this user first:
                IndicatorPermission globalPermission = null;
                // if the permissions have already been populated, get the global permission from there
                if (_indicatorPermissions != null) _indicatorPermissions.TryGetValue(Guid.Empty, out globalPermission);
                else globalPermission = _db.IndicatorPermissions.FirstOrDefault(o => o.UserId == _user.Id && o.IndicatorId == null);

                // check if the user has the correct global permission
                var hasGlobalPermission = false;
                if (globalPermission != null)
                {
                    if (permissionType == PermissionType.View) hasGlobalPermission = true;
                    else if (permissionType == PermissionType.Edit) hasGlobalPermission = globalPermission.Edit;
                    else if (permissionType == PermissionType.Submit) hasGlobalPermission = globalPermission.Submit;
                    else if (permissionType == PermissionType.Verify) hasGlobalPermission = globalPermission.Verify;
                    else if (permissionType == PermissionType.Approve) hasGlobalPermission = globalPermission.Approve;
                }

                // if the user doesn't have the global permission for this type (view/edit/submit/etc),
                // then filter to those indicators where they have the relevant permission
                if (!hasGlobalPermission)
                {
                    // apply a filter to get the indicators they have the appropriate permission for...
                    indicatorQuery = indicatorQuery.Where(
                        o => o.IndicatorPermissions.Any(
                            p => p.UserId == _user.Id && (
                                permissionType == PermissionType.View
                                || (permissionType == PermissionType.Edit && p.Edit)
                                || (permissionType == PermissionType.Submit && p.Submit)
                                || (permissionType == PermissionType.Verify && p.Verify)
                                || (permissionType == PermissionType.Approve && p.Approve)
                            )
                        )
                    );
                }

                // apply a filter to get the indicators that link to entity types which the user has permission for
                indicatorQuery = indicatorQuery
                    .Where(o => o.EntityType.Entities.Where(e => e.EntityPermissions.Any(ep => ep.UserId == _user.Id)).Any());
            }

            // return the query
            return indicatorQuery;
        }

        public IQueryable<Entity> GetPermittedEntitiesQuery()
        {
            IQueryable<Entity> query = _db.Entities;

            if (!IsInRole(RolesEnums.Administrator))
            {
                query = query.Where(o => o.EntityPermissions.Any(ep => ep.UserId == Id));
            }

            // return the query
            return query;
        }

        public IQueryable<Response> GetPermittedResponsesQuery()
        {
            IQueryable<Response> query = _db.Responses;

            if (!IsInRole(RolesEnums.Administrator))
            {
                if (!IsInRole(RolesEnums.Questionnaires))
                    query = query.Where(o => false);
                else
                    query = query.Where(o => o.Entity.EntityPermissions.Any(ep => ep.UserId == Id));
            }

            // return the query
            return query;
        }
    }
}