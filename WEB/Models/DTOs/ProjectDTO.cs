using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class ProjectDTO
    {
        [Required]
        public Guid ProjectId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        [MaxLength(7)]
        public string Colour { get; set; }

        public virtual List<MilestoneDTO> Milestones { get; set; } = new List<MilestoneDTO>();

    }

    public static partial class ModelFactory
    {
        public static ProjectDTO Create(Project project, bool includeParents = true, bool includeChildren = false)
        {
            if (project == null) return null;

            var projectDTO = new ProjectDTO();

            projectDTO.ProjectId = project.ProjectId;
            projectDTO.Name = project.Name;
            projectDTO.Colour = project.Colour;

            if (includeChildren)
            {
                foreach (var milestone in project.Milestones)
                    projectDTO.Milestones.Add(Create(milestone));
            }

            return projectDTO;
        }

        public static void Hydrate(Project project, ProjectDTO projectDTO)
        {
            project.Name = projectDTO.Name;
            project.Colour = projectDTO.Colour;
        }
    }
}
