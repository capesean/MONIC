using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Monic.Web.Services
{
    public abstract class StorageServiceBase
    {
        private readonly BlobContainerClient _containerClient;

        protected StorageServiceBase(string connectionString, string containerName)
        {
            var blobServiceClient = new BlobServiceClient(connectionString);
            _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        }

        public async Task UploadBlobAsync(Guid id, byte[] bytes)
        {
            var blobClient = _containerClient.GetBlobClient(id.ToString().ToLowerInvariant());

            using var memoryStream = new MemoryStream(bytes);
            await blobClient.UploadAsync(memoryStream, overwrite: true);
        }

        public async Task DeleteBlobAsync(Guid id)
        {
            var blobClient = _containerClient.GetBlobClient(id.ToString().ToLowerInvariant());
            await blobClient.DeleteIfExistsAsync();
        }

        public async Task<byte[]> GetBlobAsync(Guid id)
        {
            var blobClient = _containerClient.GetBlobClient(id.ToString().ToLowerInvariant());

            if (!await blobClient.ExistsAsync())
                return null;

            using var memoryStream = new MemoryStream();
            await blobClient.DownloadToAsync(memoryStream);

            return memoryStream.ToArray();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            var blobClient = _containerClient.GetBlobClient(id.ToString().ToLowerInvariant());
            return await blobClient.ExistsAsync();
        }

        public async Task<List<BlobItem>> GetAllBlobsAsync()
        {
            var blobs = new List<BlobItem>();

            await foreach (var blobItem in _containerClient.GetBlobsAsync())
            {
                blobs.Add(blobItem);
            }

            return blobs;
        }

        public Task EnsureContainerExistsAsync()
        {
            return _containerClient.CreateIfNotExistsAsync();
        }
    }
}