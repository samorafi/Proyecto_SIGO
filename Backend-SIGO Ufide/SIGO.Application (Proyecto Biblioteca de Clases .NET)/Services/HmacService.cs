using SIGO.Application.Abstractions;
using System.Security.Cryptography;
using System.Text;

namespace SIGO.Infrastructure.Services.Security
{
    public class HmacService : IHmacService
    {
        private readonly byte[] _key;

        public HmacService(string key)
        {
            _key = Encoding.UTF8.GetBytes(key);
        }

        public string HmacSha256(string input)
        {
            using var hmac = new HMACSHA256(_key);
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = hmac.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}