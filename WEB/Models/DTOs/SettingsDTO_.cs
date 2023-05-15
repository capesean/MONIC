using System;
using System.Collections.Generic;

namespace WEB.Models
{
    public partial class SettingsDTO
    {
        public SettingsDTO()
        {
        }
    }

    public static partial class ModelFactory
    {
        public static SettingsDTO Create(Settings settings)
        {
            if (settings == null) return null;

            var settingsDTO = new SettingsDTO();

            // populate dto from db fields here

            return settingsDTO;
        }

        public static void Hydrate(Settings settings, SettingsDTO settingsDTO)
        {
            // hydrate settings from dto here
        }
    }
}
