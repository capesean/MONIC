using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class TaskDTO
    {
        [Required]
        public Guid TaskId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(250)]
        public string Name { get; set; }

        [Required]
        public Guid MilestoneId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public decimal PercentCompleted { get; set; }

        public DateTime? CompletionDate { get; set; }

        public string Description { get; set; }

        [MaxLength(7)]
        public string Colour { get; set; }

        public MilestoneDTO Milestone { get; set; }

    }

    public static partial class ModelFactory
    {
        public static TaskDTO Create(Task task, bool includeParents = true, bool includeChildren = false)
        {
            if (task == null) return null;

            var taskDTO = new TaskDTO();

            taskDTO.TaskId = task.TaskId;
            taskDTO.Name = task.Name;
            taskDTO.MilestoneId = task.MilestoneId;
            taskDTO.StartDate = task.StartDate;
            taskDTO.EndDate = task.EndDate;
            taskDTO.PercentCompleted = task.PercentCompleted;
            taskDTO.CompletionDate = task.CompletionDate;
            taskDTO.Description = task.Description;
            taskDTO.Colour = task.Colour;

            if (includeParents)
            {
                taskDTO.Milestone = Create(task.Milestone);
            }

            return taskDTO;
        }

        public static void Hydrate(Task task, TaskDTO taskDTO)
        {
            task.Name = taskDTO.Name;
            task.MilestoneId = taskDTO.MilestoneId;
            task.StartDate = taskDTO.StartDate;
            task.EndDate = taskDTO.EndDate;
            task.PercentCompleted = taskDTO.PercentCompleted;
            task.CompletionDate = taskDTO.CompletionDate;
            task.Description = taskDTO.Description;
            task.Colour = taskDTO.Colour;
        }
    }
}
