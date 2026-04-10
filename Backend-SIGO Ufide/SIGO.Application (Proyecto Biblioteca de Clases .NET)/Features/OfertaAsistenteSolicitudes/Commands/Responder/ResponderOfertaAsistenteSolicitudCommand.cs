using MediatR;

namespace SIGO.Application.Features.OfertaAsistenteSolicitudes.Commands.Responder;

public record ResponderOfertaAsistenteSolicitudCommand(string Token, string Accion) : IRequest<string>;