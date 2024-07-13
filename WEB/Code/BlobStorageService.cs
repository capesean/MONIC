using Azure.Storage.Blobs;

namespace WEB
{
    public class BlobStorageService
    {
        private readonly BlobContainerClient _containerClient;

        public BlobStorageService(string connectionString, string containerName)
        {
            var blobServiceClient = new BlobServiceClient(connectionString);
            _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            _containerClient.CreateIfNotExists();
        }

        public async Task UploadDocumentAsync(Guid documentId, byte[] fileContents)
        {
            var blobClient = _containerClient.GetBlobClient(documentId.ToString().ToLowerInvariant());

            await using (var memoryStream = new MemoryStream(fileContents))
            {
                await blobClient.UploadAsync(memoryStream, true);
            }
        }

        public async Task DeleteDocumentAsync(Guid documentId)
        {
            var blobClient = _containerClient.GetBlobClient(documentId.ToString().ToLowerInvariant());

            await blobClient.DeleteAsync();
        }

        public async Task<byte[]> GetDocumentAsync(Guid documentId)
        {
            var blobClient = _containerClient.GetBlobClient(documentId.ToString().ToLowerInvariant());

            using (var memoryStream = new MemoryStream())
            {
                await blobClient.DownloadToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }
    }
}