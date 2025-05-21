using System;
using System.ComponentModel.DataAnnotations;

namespace WEB.Models
{
    public class OptionListDTO
    {
        [Required]
        public Guid OptionListId { get; set; }

        [DisplayFormat(ConvertEmptyStringToNull = false), MaxLength(50)]
        public string Name { get; set; }

        public virtual List<FieldDTO> Fields { get; set; } = new List<FieldDTO>();

        public virtual List<IndicatorDTO> Indicators { get; set; } = new List<IndicatorDTO>();

        public virtual List<OptionDTO> Options { get; set; } = new List<OptionDTO>();

    }

    public static partial class ModelFactory
    {
        public static OptionListDTO Create(OptionList optionList, bool includeParents = true, bool includeChildren = false)
        {
            if (optionList == null) return null;

            var optionListDTO = new OptionListDTO();

            optionListDTO.OptionListId = optionList.OptionListId;
            optionListDTO.Name = optionList.Name;

            if (includeChildren)
            {
                foreach (var field in optionList.Fields)
                    optionListDTO.Fields.Add(Create(field));
                foreach (var indicator in optionList.Indicators)
                    optionListDTO.Indicators.Add(Create(indicator));
                foreach (var option in optionList.Options)
                    optionListDTO.Options.Add(Create(option));
            }

            return optionListDTO;
        }

        public static void Hydrate(OptionList optionList, OptionListDTO optionListDTO)
        {
            optionList.Name = optionListDTO.Name;
        }
    }
}
