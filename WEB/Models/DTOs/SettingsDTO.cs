using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class SettingsDTO
    {
        [Required]
        public Guid Id { get; set; }

        [MaxLength(50)]
        public string TestSetting { get; set; }

    }

    public static partial class ModelFactory
    {
        public static SettingsDTO Create(Settings settings, bool includeParents = true, bool includeChildren = false)
        {
            if (settings == null) return null;

            var settingsDTO = new SettingsDTO();

            settingsDTO.Id = settings.Id;
            settingsDTO.TestSetting = settings.TestSetting;

            return settingsDTO;
        }

        public static void Hydrate(Settings settings, SettingsDTO settingsDTO)
        {
            settings.TestSetting = settingsDTO.TestSetting;
        }
    }
}
