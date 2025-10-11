namespace SIGO.Application.Common.Exceptions;

public class AppValidationException : Exception
{
    public IReadOnlyList<string> Errors { get; }

    public AppValidationException(IEnumerable<string> errors)
        : base("Hay errores de validación.")
        => Errors = errors.ToArray();
}
