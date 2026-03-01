using MediatR;

namespace SIGO.Application.Features.SolicitudesOferta.Commands.Enviar;

public record EnviarSolicitudOfertaCommand(EnviarSolicitudOfertaRequest Data) : IRequest<int>;
