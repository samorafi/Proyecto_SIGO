using MediatR;

namespace SIGO.Application.Features.Persona.Commands.Deactivate
{
    // Este objeto transportará los datos necesarios desde la API hasta la lógica de negocio.
    public class DeactivatePersonaCommand : IRequest<bool>
    {
        public int Id { get; set; }
        public int MotivoDesvinculacionId { get; set; }
        public int PeriodoDesvinculacionId { get; set; }
        public string? Comentarios { get; set; }
    }
}