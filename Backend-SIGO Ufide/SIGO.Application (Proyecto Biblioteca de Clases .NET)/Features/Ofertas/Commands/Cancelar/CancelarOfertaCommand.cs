using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application.Features.Ofertas.Commands.Cancelar
{
    public record CancelarOfertaCommand(int OfertaId) : IRequest<bool>;

}
