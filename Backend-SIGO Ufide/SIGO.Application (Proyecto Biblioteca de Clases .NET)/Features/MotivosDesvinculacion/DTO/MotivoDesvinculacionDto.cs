using SIGO.Domain.Entities;

namespace SIGO.Application.Features.MotivosDesvinculacion.DTO
{
    public class MotivoDesvinculacionDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        public static MotivoDesvinculacionDto FromEntity(MotivoDesvinculacion entity)
        {
            return new MotivoDesvinculacionDto
            {
                Id = entity.MotivoDesvinculacionId,
                Nombre = entity.Nombre
            };
        }
    }
}