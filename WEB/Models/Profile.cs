namespace WEB.Models
{
    public class ProfileModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public Guid? OrganisationId { get; set; }
        public OrganisationDTO Organisation { get; set; }
        public Guid[] EntityIds { get; set; }
        public List<IndicatorPermissionDTO> IndicatorPermissions { get; set; }
        public string DashboardSettings { get; set; }
    }
}
