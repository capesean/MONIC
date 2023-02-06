using System;
using System.Collections.Generic;

namespace WEB.Models
{
    public partial class DbSettingsDTO
    {
        public string TestField { get; set; }

        public DbSettingsDTO()
        {
        }
    }

    public static partial class ModelFactory
    {
        public static DbSettingsDTO Create(DbSettings settings)
        {
            if (settings == null) return null;

            var settingsDTO = new DbSettingsDTO();

            // populate dto from db fields here

            return settingsDTO;
        }

        public static void Hydrate(DbSettings settings, DbSettingsDTO settingsDTO)
        {
            // hydrate settings from dto here
        }
    }
}
