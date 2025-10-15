using SIGO.Domain.Entities;

namespace SIGO.Application.Features.TiposContrato.DTO
{
    public class TipoContratoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        public static TipoContratoDto FromEntity(TipoContrato entity)
        {
            return new TipoContratoDto
            {
                Id = entity.TipoContratoId,
                Nombre = entity.Nombre
            };
        }
    }
}