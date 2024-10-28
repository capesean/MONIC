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

        public async Task UploadBlobAsync(string id, byte[] bytes)
        {
            var blobClient = _containerClient.GetBlobClient(id);

            await using (var memoryStream = new MemoryStream(bytes))
            {
                await blobClient.UploadAsync(memoryStream, true);
            }
        }

        public async Task DeleteBlobAsync(string id)
        {
            var blobClient = _containerClient.GetBlobClient(id);

            await blobClient.DeleteIfExistsAsync();
        }

        public async Task<byte[]> GetBlobAsync(string id)
        {
            var blobClient = _containerClient.GetBlobClient(id);

            using (var memoryStream = new MemoryStream())
            {
                await blobClient.DownloadToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }
    }
}