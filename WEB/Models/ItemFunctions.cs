using Microsoft.EntityFrameworkCore;

namespace WEB.Models
{
    public static class ItemFunctions
    {
        public static async System.Threading.Tasks.Task HydrateFieldsAsync(ApplicationDbContext db, Guid itemId, ICollection<ItemFieldDTO> itemFields, ICollection<ItemOptionDTO> itemOptions)
        {
            DeleteFields(db, itemId);

            var fields = await db.Fields.ToDictionaryAsync(o => o.FieldId);

            foreach (var itemField in itemFields)
            {
                var field = fields[itemField.FieldId];
                if (field.FieldType != FieldType.Date && field.FieldType != FieldType.Text && field.FieldType != FieldType.YesNo) continue;
                if (string.IsNullOrWhiteSpace(itemField.Value)) continue;

                // validation checks here: minlength, maxlength, unique
                //if(field.MaxLength)

                db.Entry(new ItemField { ItemId = itemId, FieldId = itemField.FieldId, Value = itemField.Value }).State = EntityState.Added;
            }

            foreach (var itemOption in itemOptions)
            {
                // this is the 'unselect' option set in the authorization.profile controller
                if (itemOption.OptionId == Guid.Empty) continue;

                // validation checks here: multiple

                db.Entry(new ItemOption { ItemId = itemId, OptionId = itemOption.OptionId }).State = EntityState.Added;
            }

            //foreach (var fileDTO in organisationDTO.Files)
            //{
            //    var file = await db.Files.SingleOrDefaultAsync(o => o.OrganisationId == organisation.OrganisationId && o.FieldId == fileDTO.FieldId);

            //    if (file == null)
            //    {
            //        file = new File() { OrganisationId = organisation.OrganisationId, FieldId = fileDTO.FieldId };
            //        db.Entry(file).State = EntityState.Added;
            //    }
            //    else
            //    {
            //        db.Entry(file).State = EntityState.Modified;
            //    }
            //    file.UploadedOn = DateTime.UtcNow;
            //    file.FileName = fileDTO.FileName;
            //    file.FileContents = fileDTO.FileContents;
            //}


        }

        public static void DeleteFields(ApplicationDbContext db, Guid itemId, bool deleteItem = false)
        {
            // todo: put these in a transaction, use SQL
            foreach (var itemField in db.ItemFields.Where(o => o.ItemId == itemId).ToList())
                db.Entry(itemField).State = EntityState.Deleted;

            foreach (var itemOption in db.ItemOptions.Where(o => o.ItemId == itemId).ToList())
                db.Entry(itemOption).State = EntityState.Deleted;

            if (deleteItem)
            {
                var item = db.Items.FirstOrDefault(o => o.ItemId == itemId);
                if (item != null) db.Entry(item).State = EntityState.Deleted;
            }

        }

        public static void DeleteDocuments(ApplicationDbContext db, Guid itemId, bool deleteItem = false)
        {
            // todo: put these in a transaction, use SQL
            foreach (var documentId in db.Documents.Where(o => o.ItemId == itemId).Select(o => o.DocumentId).ToList())
                db.Entry(new Document { DocumentId = documentId }).State = EntityState.Deleted;

            if (deleteItem)
                db.Entry(db.Items.First(o => o.ItemId == itemId)).State = EntityState.Deleted;

        }
    }
}
