using FluentValidation;

namespace SIGO.Application.Features.Nomina.Commands.GenerarNominaExcel
{
    public class GenerarNominaPdfValidator : AbstractValidator<GenerarNominaExcelCommand>
    {
        public GenerarNominaPdfValidator()
        {
            RuleFor(x => x.Rows)
                .NotNull()
                .Must(r => r.Count > 0).WithMessage("Debe enviar al menos un docente.");

            RuleForEach(x => x.Rows).ChildRules(r =>
            {
                r.RuleFor(x => x.NombreCompleto).NotEmpty();
            });

            
            RuleFor(x => x).Must(NoEsEjemploSwagger)
                .WithMessage("Estás enviando el ejemplo 'string' en lugar de la nómina real.");
        }

        private bool NoEsEjemploSwagger(GenerarNominaExcelCommand cmd)
        {
            if (cmd.Rows == null || cmd.Rows.Count == 0) return false;
            if (cmd.Rows.Count == 1)
            {
                var r = cmd.Rows[0];
                return !(
                    (r.NombreCompleto?.Trim() ?? "") == "string" &&
                    (r.PeriodoIngreso?.Trim() ?? "") == "string" &&
                    (r.PeriodoDesvinculacion?.Trim() ?? "") == "string" &&
                    (r.Estado?.Trim() ?? "") == "string" &&
                    (r.MotivoDesvinculacion?.Trim() ?? "") == "string"
                );
            }
            return true;
        }
    }
}
