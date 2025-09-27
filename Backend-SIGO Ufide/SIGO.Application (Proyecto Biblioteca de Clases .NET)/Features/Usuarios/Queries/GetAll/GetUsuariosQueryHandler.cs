using MediatR;
using SIGO.Application.Abstractions;
using SIGO.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace SIGO.Application.Features.Usuarios.Queries.GetAll
{
    public class GetUsuariosQueryHandler : IRequestHandler<GetUsuariosQuery, List<Usuario>>
    {
        private readonly IApplicationDbContext _context;

        public GetUsuariosQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Usuario>> Handle(GetUsuariosQuery request, CancellationToken cancellationToken)
        {
            return await _context.Usuarios.ToListAsync(cancellationToken);
        }
    }
}
