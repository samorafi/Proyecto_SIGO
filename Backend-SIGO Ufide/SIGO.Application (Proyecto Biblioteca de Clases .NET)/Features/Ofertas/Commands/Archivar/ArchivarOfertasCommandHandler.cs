using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.Ofertas.Dto;
using System.Text.RegularExpressions;

namespace SIGO.Application.Features.Ofertas.Commands.Archivar
{
    public class ArchivarOfertasCommandHandler
        : IRequestHandler<ArchivarOfertasCommand, ArchivarOfertasResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public ArchivarOfertasCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ArchivarOfertasResponseDto> Handle(
            ArchivarOfertasCommand request,
            CancellationToken cancellationToken)
        {
            var result = await _context.SqlQueryAsync<string>(
                $"SELECT universidad.archivar_ofertas_por_periodo({request.PeriodoId});",
                cancellationToken
            );

            var mensaje = result.Single();
            bool yaArchivadas = mensaje.Contains("ya se encuentran archivadas");
            int total = ExtraerNumero(mensaje);

            return new ArchivarOfertasResponseDto
            {
                Mensaje = mensaje,
                YaArchivadas = yaArchivadas,
                TotalAfectadas = total
            };
        }

        private int ExtraerNumero(string texto)
        {
            var match = Regex.Match(texto, @"\d+");
            return match.Success ? int.Parse(match.Value) : 0;
        }
    }
}
