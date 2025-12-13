using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;
using System.Text.RegularExpressions;

namespace SIGO.Application.Features.Ofertas.Commands.ArchivarPorModalidad
{
    public class ArchivarOfertasPorModalidadCommandHandler
        : IRequestHandler<ArchivarOfertasPorModalidadCommand, ArchivarOfertasPorModalidadResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public ArchivarOfertasPorModalidadCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ArchivarOfertasPorModalidadResponseDto> Handle(
            ArchivarOfertasPorModalidadCommand request,
            CancellationToken cancellationToken)
        {
            // Convertir lista C# → arreglo SQL {1,2,3}
            var modalidadesSql = "{" + string.Join(",", request.Modalidades) + "}";

            var result = await _context.SqlQueryAsync<string>(
                $"SELECT universidad.archivar_ofertas_por_periodo_y_modalidad({request.PeriodoId}, {modalidadesSql}::int[]);",
                cancellationToken
            );

            var mensaje = result.Single();

            bool yaArchivadas = mensaje.Contains("ya estaban archivadas");
            int total = ExtraerNumero(mensaje);

            return new ArchivarOfertasPorModalidadResponseDto
            {
                Mensaje = mensaje,
                YaArchivadas = yaArchivadas,
                TotalAfectadas = total
            };
        }

        private static int ExtraerNumero(string texto)
        {
            var match = Regex.Match(texto, @"\d+");
            return match.Success ? int.Parse(match.Value) : 0;
        }
    }
}
