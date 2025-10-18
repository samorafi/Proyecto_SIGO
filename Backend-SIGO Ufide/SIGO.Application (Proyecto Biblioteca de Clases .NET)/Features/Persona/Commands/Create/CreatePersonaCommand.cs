using MediatR;

namespace SIGO.Application.Features.Personas.Commands.Create
{
    // Este DTO ahora refleja todos los campos que el usuario final seleccionará en el formulario.
    public class CreatePersonaCommand : IRequest<int>
    {
        // Campos Directos
        public string Nombre { get; set; } = string.Empty;
        public string Cedula { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public DateTime? FechaIngreso { get; set; }
        public string? Comentarios { get; set; }

        // Campos de Relación (Claves Foráneas)
        public int GeneroId { get; set; }
        public int AtestadoId { get; set; }
        public int ProvinciaId { get; set; }
        public int CantonId { get; set; }
        public int CategoriaId { get; set; }
        public int TipoContratoId { get; set; }
        public int? RolDocenteId { get; set; }
        public bool? EnLinea { get; set; }

    }
}
