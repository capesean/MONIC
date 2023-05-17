namespace WEB.Models
{
    public class FieldsDTO
    {
        public List<FieldValueDTO> FieldValues { get; set; }

        public List<OptionValueDTO> OptionValues { get; set; }

        //public List<FileDTO> Files { get; set; }

        public void AddFields(Item item)
        {
            if (item == null) return;
            FieldValues = item.FieldValues.Select(o => ModelFactory.Create(o, false)).ToList();
            OptionValues = item.OptionValues.Select(o => ModelFactory.Create(o, false)).ToList();
        }

        public bool ValidateFields(ApplicationDbContext db, ItemType itemType, out string error)
        {
            var fields = db.Fields.Where(o =>
                itemType == ItemType.Entity ? o.Entity
                : itemType == ItemType.Organisation ? o.Organisation
                : itemType == ItemType.Indicator ? o.Indicator
                : false
                )
                .ToList();

            var options = db.Options.ToList();

            foreach (var field in fields)
            {
                if (field.Required)
                {
                    if (field.FieldType == FieldType.Picklist)
                    {

                        if (!OptionValues.Any(o => options.Where(opt => opt.FieldId == field.FieldId).Any(opt => opt.OptionId == o.OptionId)))
                        {
                            error = $"No value provided for {field.Name}";
                            return false;
                        }
                    }
                    else
                    {
                        if (!FieldValues.Any(o => o.FieldId == field.FieldId))
                        {
                            error = $"No value provided for {field.Name}";
                            return false;
                        }
                    }
                }

                if (field.FieldType == FieldType.Text && field.IsUnique)
                {
                    var fieldValue = FieldValues.FirstOrDefault(o => o.FieldId == field.FieldId);
                    if (fieldValue != null && !string.IsNullOrWhiteSpace(fieldValue.Value))
                    {
                        if (db.FieldValues.Any(o => o.FieldId == field.FieldId && o.Value == fieldValue.Value && o.ItemId != fieldValue.ItemId))
                        {
                            error = $"Value for {field.Name} is not unique";
                            return false;
                        }
                    }
                }
            }

            error = null;
            return true;
        }

    }

}
