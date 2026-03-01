namespace SIGO.Application.Models
{
    public sealed record ExportFileResult(byte[] Content, string ContentType, string FileName);
}
