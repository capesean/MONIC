using Monic.Web.Settings;

namespace Monic.Web.Services
{
    public class DocumentsStorageService : StorageServiceBase
    {
        public DocumentsStorageService(DocumentsSettings settings)
            : base(settings.ConnectionString, settings.ContainerName)
        {
        }
    }
}