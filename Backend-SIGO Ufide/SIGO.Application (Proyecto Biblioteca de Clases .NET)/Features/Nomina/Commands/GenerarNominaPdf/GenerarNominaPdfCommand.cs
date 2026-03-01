using MediatR;
using SIGO.Application.Common.Dto;
using SIGO.Application.Features.Nomina.Dto;

namespace SIGO.Application.Features.Nomina.Commands.GenerarNominaPdf
{
    public class GenerarNominaPdfCommand : IRequest<ExportFileDto>
    {
        public NominaDocenteMetaDto Meta { get; set; } = new();
        public List<NominaDocenteRowDto> Rows { get; set; } = new();
    }
}
