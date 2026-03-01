using SIGO.Domain.Entities;

namespace SIGO.Application.Features.Atestados.DTO
{
    public class AtestadoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        public static AtestadoDto FromEntity(Atestado atestado)
        {
            return new AtestadoDto
            {
                Id = atestado.AtestadoId,
                Nombre = atestado.Nombre
            };
        }
    }
}
