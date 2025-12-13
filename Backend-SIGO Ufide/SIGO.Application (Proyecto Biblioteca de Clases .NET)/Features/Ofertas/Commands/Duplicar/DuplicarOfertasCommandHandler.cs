using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;
using System.Text;

namespace SIGO.Application.Features.Ofertas.Commands.Duplicar
{
    public class DuplicarOfertasCommandHandler
        : IRequestHandler<DuplicarOfertasCommand, DuplicarOfertasResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public DuplicarOfertasCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DuplicarOfertasResponseDto> Handle(
            DuplicarOfertasCommand request,
            CancellationToken cancellationToken)
        {
            // Convertir lista C# → array SQL {1,2,3}
            var modalidadesSql = "{" + string.Join(",", request.Modalidades) + "}";

            // Ejecutar el SP
            var result = await _context.SqlQueryAsync<DuplicarOfertasResult>(
                $"SELECT * FROM universidad.duplicar_ofertas_por_periodo({request.PeriodoOrigen}, {request.PeriodoDestino}, {modalidadesSql}::int[]);",
                cancellationToken
            );

            var row = result.Single();

            return new DuplicarOfertasResponseDto
            {
                TotalDuplicadas = row.total_duplicadas,
                Mensaje = row.mensaje
            };
        }
    }
}
