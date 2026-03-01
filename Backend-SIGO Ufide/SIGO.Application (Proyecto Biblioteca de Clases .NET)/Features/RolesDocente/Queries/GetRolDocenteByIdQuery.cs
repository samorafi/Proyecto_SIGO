using MediatR;
using SIGO.Application.Features.RolesDocente.Dto;

namespace SIGO.Application.Features.RolesDocente.Queries;

public sealed record GetRolDocenteByIdQuery(int Id) : IRequest<RolDocenteResponseDto?>;
