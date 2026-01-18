namespace SIGO.Application.Common.Dto
{
    public class ExportFileDto
    {
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string ContentType { get; set; } = "application/octet-stream";
        public string FileName { get; set; } = "archivo.bin";
    }
}
