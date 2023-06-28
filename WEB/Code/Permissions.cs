using Microsoft.EntityFrameworkCore;
using WEB.Models;

namespace WEB
{
    public static partial class Permissions
    {
        public static async System.Threading.Tasks.Task SetEntityPermissionsAsync(ApplicationDbContext db, AppSettings appSettings, Guid? organisationId, Guid entityId)
        {
            // if not simple permissions, don't change
            // also: if not in an org, there's nothing to do (need the entityLink/s to be able to set any oversight permissions based on affiliated entity)
            // this method is called for entity changes; any entityLink changes will call the oversight entity permissions methods, and those permissions are set therein
            if (!appSettings.GetDbSettings(db).SimplePermissionsMode) return;

            if (organisationId.HasValue)
            {
                // add the entity to all org users
                foreach (var user in await db.Users.Include(o => o.EntityPermissions).Where(o => o.OrganisationId == organisationId).ToListAsync())
                {
                    if (!user.EntityPermissions.Any(o => o.EntityId == entityId))
                    {
                        var entityPermission = new EntityPermission();
                        entityPermission.UserId = user.Id;
                        entityPermission.EntityId = entityId;

                        db.Entry(entityPermission).State = EntityState.Added;
                    }
                }
            }

            // remove the permissions for this entity from all OTHER org users
            // 1) user is in an org
            // 2) has permission to this entity
            // 3) user is in a diff. org to this entity OR this entity is not in an org
            foreach (var entityPermission in await db.EntityPermissions.Where(o =>
                o.User.OrganisationId.HasValue
                && o.EntityId == entityId
                && (o.User.OrganisationId != organisationId || organisationId == null)).ToListAsync())
            {
                db.Entry(entityPermission).State = EntityState.Deleted;
            }
        }

        public static async System.Threading.Tasks.Task RemoveOversightEntityPermissionsAsync(ApplicationDbContext db, AppSettings appSettings, EntityLink entityLink)
        {
            if (!appSettings.GetDbSettings(db).SimplePermissionsMode) return;

            var oversightRole = await db.Roles.Where(o => o.Name == Roles.Oversight.ToString()).FirstAsync();

            // get all entity permissions: user in oversight role, affiliated with the parent entity, with the child permission/link
            var query = db.EntityPermissions
                .Where(o => o.User.Roles.Any(r => r.RoleId == oversightRole.Id))
                .Where(o => o.User.AffiliatedEntityId == entityLink.ParentEntityId)
                .Where(o => o.EntityId == entityLink.ChildEntityId);

            foreach (var entityPermission in await query.ToListAsync())
            {
                db.Entry(entityPermission).State = EntityState.Deleted;
            }
        }

        public static async System.Threading.Tasks.Task AddOversightEntityPermissionsAsync(ApplicationDbContext db, AppSettings appSettings, EntityLink entityLink)
        {
            if (!appSettings.GetDbSettings(db).SimplePermissionsMode) return;

            var oversightRole = await db.Roles.Where(o => o.Name == Roles.Oversight.ToString()).FirstAsync();

            // get all users: in oversight role, affiliated with the parent entity, without the child permission/link
            var query = db.Users
                .Where(o => o.Roles.Any(r => r.RoleId == oversightRole.Id))
                .Where(o => o.AffiliatedEntityId == entityLink.ParentEntityId)
                .Where(o => !o.EntityPermissions.Any(p => p.EntityId == entityLink.ChildEntityId));

            foreach (var user in await query.ToListAsync())
            {
                var entityPermission = new EntityPermission();
                entityPermission.UserId = user.Id;
                entityPermission.EntityId = entityLink.ChildEntityId;

                db.Entry(entityPermission).State = EntityState.Added;
            }
        }
    }
}