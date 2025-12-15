using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace SIGO.Application.Common.Utils
{
    public static class StringUtils
    {
        public static string NormalizarParaMatch(this string texto)
        {
            if (string.IsNullOrWhiteSpace(texto)) return string.Empty;

            texto = texto.Replace('\u00A0', ' ');
            texto = Regex.Replace(texto, @"\s+", " ");

            var textoNormalizado = texto.Trim().ToUpper();
            var normalizedString = textoNormalizado.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }
    }
}