using MediatR;
using SIGO.Application.Features.Ofertas.Commands.Create;

namespace SIGO.Application.Features.Ofertas.Commands.Create;

public record CreateOfertaCommand(CreateOfertaRequest Data) : IRequest<int>;
