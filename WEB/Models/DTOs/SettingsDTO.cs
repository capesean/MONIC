using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class SettingsDTO
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        public bool UseSubmit { get; set; }

        [Required]
        public bool UseVerify { get; set; }

        [Required]
        public bool UseApprove { get; set; }

        [Required]
        public bool UseReject { get; set; }

        [MaxLength(100)]
        public string ChatGPTAPIKey { get; set; }

    }

    public static partial class ModelFactory
    {
        public static SettingsDTO Create(Settings settings, bool includeParents = true, bool includeChildren = false)
        {
            if (settings == null) return null;

            var settingsDTO = new SettingsDTO();

            settingsDTO.Id = settings.Id;
            settingsDTO.UseSubmit = settings.UseSubmit;
            settingsDTO.UseVerify = settings.UseVerify;
            settingsDTO.UseApprove = settings.UseApprove;
            settingsDTO.UseReject = settings.UseReject;
            settingsDTO.ChatGPTAPIKey = settings.ChatGPTAPIKey;

            return settingsDTO;
        }

        public static void Hydrate(Settings settings, SettingsDTO settingsDTO)
        {
            settings.UseSubmit = settingsDTO.UseSubmit;
            settings.UseVerify = settingsDTO.UseVerify;
            settings.UseApprove = settingsDTO.UseApprove;
            settings.UseReject = settingsDTO.UseReject;
            settings.ChatGPTAPIKey = settingsDTO.ChatGPTAPIKey;
        }
    }
}
