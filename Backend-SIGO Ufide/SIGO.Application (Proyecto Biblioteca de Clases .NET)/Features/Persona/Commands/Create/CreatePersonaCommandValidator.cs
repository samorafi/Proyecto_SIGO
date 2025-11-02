using FluentValidation;

namespace SIGO.Application.Features.Persona.Commands.Create
{
    public class CreatePersonaCommandValidator : AbstractValidator<CreatePersonaCommand>
    {
        public CreatePersonaCommandValidator()
        {
            RuleFor(p => p.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio.")
                .MaximumLength(50);

            RuleFor(p => p.PrimerApellido)
                .NotEmpty().WithMessage("El primer apellido es obligatorio.")
                .MaximumLength(50);

            RuleFor(p => p.SegundoApellido)   
                .NotEmpty().WithMessage("El segundo apellido es obligatorio.")
                .MaximumLength(50);

            RuleFor(p => p.Cedula)
                .NotEmpty().WithMessage("La cédula es obligatoria.")
                .MaximumLength(50);

            RuleFor(p => p.Correo)
                .NotEmpty().WithMessage("El correo es obligatorio.")
                .EmailAddress().WithMessage("El formato del correo no es válido.")
                .MaximumLength(100);

            RuleFor(p => p.GeneroId).GreaterThan(0);
            RuleFor(p => p.ProvinciaId).GreaterThan(0);
            RuleFor(p => p.CantonId).GreaterThan(0);
            RuleFor(p => p.CategoriaId).GreaterThan(0);
            RuleFor(p => p.AtestadoId).GreaterThan(0);
            RuleFor(p => p.TipoContratoId).GreaterThan(0);

            When(p => p.RolDocenteId.HasValue, () =>
                RuleFor(p => p.RolDocenteId!.Value).GreaterThan(0));

            When(p => p.PeriodoIngresoId.HasValue, () =>
                RuleFor(p => p.PeriodoIngresoId!.Value).GreaterThan(0));
        }
    }
}
