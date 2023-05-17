using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class MilestoneDTO
    {
        [Required]
        public Guid MilestoneId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        [Required]
        public Guid ProjectId { get; set; }

        public string Description { get; set; }

        [MaxLength(7)]
        public string Colour { get; set; }

        [Required]
        public int SortOrder { get; set; }

        public ProjectDTO Project { get; set; }

        public virtual List<TaskDTO> Tasks { get; set; } = new List<TaskDTO>();

    }

    public static partial class ModelFactory
    {
        public static MilestoneDTO Create(Milestone milestone, bool includeParents = true, bool includeChildren = false)
        {
            if (milestone == null) return null;

            var milestoneDTO = new MilestoneDTO();

            milestoneDTO.MilestoneId = milestone.MilestoneId;
            milestoneDTO.Name = milestone.Name;
            milestoneDTO.ProjectId = milestone.ProjectId;
            milestoneDTO.Description = milestone.Description;
            milestoneDTO.Colour = milestone.Colour;
            milestoneDTO.SortOrder = milestone.SortOrder;

            if (includeParents)
            {
                milestoneDTO.Project = Create(milestone.Project);
            }

            if (includeChildren)
            {
                foreach (var task in milestone.Tasks)
                    milestoneDTO.Tasks.Add(Create(task));
            }

            return milestoneDTO;
        }

        public static void Hydrate(Milestone milestone, MilestoneDTO milestoneDTO)
        {
            milestone.Name = milestoneDTO.Name;
            milestone.ProjectId = milestoneDTO.ProjectId;
            milestone.Description = milestoneDTO.Description;
            milestone.Colour = milestoneDTO.Colour;
            milestone.SortOrder = milestoneDTO.SortOrder;
        }
    }
}
