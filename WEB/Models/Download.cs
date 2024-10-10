using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System.Net.Mime;

namespace WEB.Models
{
    public static class Download
    {
        public static FileContentResult GetFileContentResult(HttpResponse response, string fileName, byte[] fileContents)
        {
            response.Headers.Append("Content-Disposition", GetContentDisposition(fileName).ToString());

            return new FileContentResult(fileContents, GetContentType(fileName))
            {
                FileDownloadName = fileName
            };
        }

        public static ContentDisposition GetContentDisposition(string fileName)
        {
            return new ContentDisposition
            {
                FileName = string.Format(fileName),
                Inline = false,
            };
        }

        public static string GetContentType(string fileName)
        {
            var provider = new FileExtensionContentTypeProvider();
            string contentType;
            if (!provider.TryGetContentType(fileName, out contentType))
            {
                contentType = "application/octet-stream";
            }
            return contentType;
        }
    }
}
