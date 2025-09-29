using FluentValidation;

namespace SIGO.Application.Features.Personas.Commands.Create
{
    public class CreatePersonaCommandValidator : AbstractValidator<CreatePersonaCommand>
    {
        public CreatePersonaCommandValidator()
        {
            RuleFor(p => p.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio.")
                .MaximumLength(100).WithMessage("El nombre no debe exceder los 100 caracteres.");

            RuleFor(p => p.Cedula)
                .NotEmpty().WithMessage("La cédula es obligatoria.")
                .MaximumLength(50).WithMessage("La cédula no debe exceder los 50 caracteres.");

            RuleFor(p => p.Correo)
                .NotEmpty().WithMessage("El correo es obligatorio.")
                .EmailAddress().WithMessage("El formato del correo no es válido.")
                .MaximumLength(100).WithMessage("El correo no debe exceder los 100 caracteres.");

            // Validamos que los IDs de los catálogos sean válidos
            RuleFor(p => p.GeneroId).GreaterThan(0).WithMessage("Debe seleccionar un género válido.");
            RuleFor(p => p.ProvinciaId).GreaterThan(0).WithMessage("Debe seleccionar una provincia válida.");
            RuleFor(p => p.CantonId).GreaterThan(0).WithMessage("Debe seleccionar un cantón válido.");
            RuleFor(p => p.CategoriaId).GreaterThan(0).WithMessage("Debe seleccionar una categoría de docente válida.");
            RuleFor(p => p.EstadoPersonaId).GreaterThan(0).WithMessage("Debe seleccionar un estado válido.");
            RuleFor(p => p.TipoContratoId).GreaterThan(0).WithMessage("Debe seleccionar un tipo de contrato válido.");
        }
    }
}