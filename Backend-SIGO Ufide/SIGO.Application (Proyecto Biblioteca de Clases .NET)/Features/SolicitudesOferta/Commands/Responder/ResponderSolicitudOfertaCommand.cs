using MediatR;

namespace SIGO.Application.Features.SolicitudesOferta.Commands.Responder;

public record ResponderSolicitudOfertaCommand(string Token, string Accion) : IRequest<string>;
