using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.ConfigSmtp.DTO;

namespace SIGO.Application.Features.ConfigSmtp.Queries.Get
{
    public class GetConfSmtpQueryHandler : IRequestHandler<GetConfSmtpQuery, ConfSmtpResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public GetConfSmtpQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ConfSmtpResponseDto> Handle(GetConfSmtpQuery request, CancellationToken cancellationToken)
        {
            var entity = await _context.ConfSmtps.FirstOrDefaultAsync(cancellationToken);

            if (entity == null)
                throw new Exception("No se encontró configuración SMTP registrada.");

            return new ConfSmtpResponseDto
            {
                Id = entity.Id,
                Host = entity.Host,
                Port = entity.Port,
                Username = entity.Username,
                EnableSsl = entity.EnableSsl,
                SenderName = entity.SenderName,
                SenderEmail = entity.SenderEmail,
                Password = entity.Password,
                UseDefaultCredentials = entity.UseDefaultCredentials,
                LastUpdated = entity.LastUpdated
            };
        }
    }
}
