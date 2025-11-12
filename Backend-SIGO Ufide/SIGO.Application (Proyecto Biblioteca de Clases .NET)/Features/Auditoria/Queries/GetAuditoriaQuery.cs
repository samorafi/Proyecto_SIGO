using MediatR;
using SIGO.Application.Features.Auditoria.Dto;
using SIGO.Application.Models.Common;

namespace SIGO.Application.Features.Auditoria.Queries
{
    public class GetAuditoriaQuery : IRequest<PagedResponse<BitacoraAuditoriaDto>>
    {
        public AuditQueryParams Params { get; }

        public GetAuditoriaQuery(AuditQueryParams queryParams)
        {
            Params = queryParams;
        }
    }
}
