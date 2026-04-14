using SIGO.Application.Abstractions;
using System.Security.Cryptography;

namespace SIGO.Infrastructure.Services.Security
{
    public class OtpGenerator : IOtpGenerator
    {
        public string GenerateNumeric(int digits = 6)
        {
            if (digits < 4 || digits > 10)
                throw new ArgumentOutOfRangeException(nameof(digits), "digits debe estar entre 4 y 10.");

            var max = (int)Math.Pow(10, digits);
            var value = RandomNumberGenerator.GetInt32(0, max);

            return value.ToString(new string('0', digits));
        }
    }
}