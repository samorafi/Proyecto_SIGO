using MediatR;

namespace SIGO.Application.Features.Persona.Commands.Update
{
    public class UpdatePersonaCommand : IRequest
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Cedula { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public DateTime? FechaIngreso { get; set; }
        public string? Comentarios { get; set; }
        public int? GeneroId { get; set; }
        public int? ProvinciaId { get; set; }
        public int? CantonId { get; set; }
        public int? CategoriaId { get; set; }
        public int? EstadoPersonaId { get; set; }
        public int? TipoContratoId { get; set; }
        public int? MotivoDesvinculacionId { get; set; }
        public int? PeriodoDesvinculacionId { get; set; }
    }
}
