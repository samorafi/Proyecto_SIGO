namespace SIGO.Application.Abstractions
{
    public interface IOtpGenerator
    {
        string GenerateNumeric(int digits = 6);
    }
}