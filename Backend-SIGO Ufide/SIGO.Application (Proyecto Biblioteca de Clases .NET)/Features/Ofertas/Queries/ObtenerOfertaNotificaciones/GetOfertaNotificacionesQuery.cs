using MediatR;
using SIGO.Application.Features.Ofertas.Dto;

namespace SIGO.Application__Proyecto_Biblioteca_de_Clases_.NET_.Features.Ofertas.Queries.ObtenerOfertaNotificaciones;
public record GetOfertaNotificacionesQuery(int OfertaId) : IRequest<OfertaResponseDto>;
