using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class SettingsDTO
    {
        [Required]
        public Guid Id { get; set; }

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
            settingsDTO.ChatGPTAPIKey = settings.ChatGPTAPIKey;

            return settingsDTO;
        }

        public static void Hydrate(Settings settings, SettingsDTO settingsDTO)
        {
            settings.ChatGPTAPIKey = settingsDTO.ChatGPTAPIKey;
        }
    }
}
