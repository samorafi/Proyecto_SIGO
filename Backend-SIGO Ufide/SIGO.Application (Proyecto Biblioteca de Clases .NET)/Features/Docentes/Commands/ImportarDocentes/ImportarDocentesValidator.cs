using FluentValidation; //Libreria que valida que si sea un archivo valido a procesar

namespace SIGO.Application.Features.Docentes.Commands.ImportarDocentes
{
    public class ImportarDocentesValidator : AbstractValidator<ImportarDocentesCommand>
    {
        public ImportarDocentesValidator()
        {
            RuleFor(x => x.ArchivoExcel)
                .NotNull().WithMessage("El archivo es requerido.")
                .Must(ValidarExtension).WithMessage("El formato del archivo debe ser .xlsx o .xls");
        }

        private bool ValidarExtension(Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null) return false;
            var ext = System.IO.Path.GetExtension(file.FileName).ToLower();
            return ext == ".xlsx" || ext == ".xls";
        }
    }
}