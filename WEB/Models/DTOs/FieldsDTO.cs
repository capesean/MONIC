using Org.BouncyCastle.Tls;
using System.Threading.Tasks;

namespace WEB.Models
{
    public class FieldsDTO
    {
        public List<ItemFieldDTO> ItemFields { get; set; }

        public List<ItemOptionDTO> ItemOptions { get; set; }

        //public List<FileDTO> Files { get; set; }

        public void AddFields(Item item)
        {
            if (item == null) return;
            ItemFields = item.ItemFields.Select(o => ModelFactory.Create(o, false)).ToList();
            ItemOptions = item.ItemOptions.Select(o => ModelFactory.Create(o, false)).ToList();
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
                        var optionIds = db.Options.Where(o => o.OptionListId == field.OptionListId).Select(o => o.OptionId).ToHashSet();

                        if (!ItemOptions.Any(o => optionIds.Contains(o.OptionId)))
                        {
                            error = $"No value provided for {field.Name}";
                            return false;
                        }
                    }
                    else
                    {
                        if (!ItemFields.Any(o => o.FieldId == field.FieldId))
                        {
                            error = $"No value provided for {field.Name}";
                            return false;
                        }
                    }
                }

                if (field.FieldType == FieldType.Text && field.IsUnique)
                {
                    var itemField = ItemFields.FirstOrDefault(o => o.FieldId == field.FieldId);
                    if (itemField != null && !string.IsNullOrWhiteSpace(itemField.Value))
                    {
                        if (db.ItemFields.Any(o => o.FieldId == field.FieldId && o.Value == itemField.Value && o.ItemId != itemField.ItemId))
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
