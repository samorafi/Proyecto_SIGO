namespace SIGO.Application.Abstractions
{
    public interface IHmacService
    {
        string HmacSha256(string input);
    }
}