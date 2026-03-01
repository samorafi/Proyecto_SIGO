using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Features.ConfigSmtp.DTO;
using SIGO.Domain.Entities;

namespace SIGO.Application.Features.ConfigSmtp.Commands.CreateOrUpdate
{
    public class CreateOrUpdateConfSmtpCommandHandler
        : IRequestHandler<CreateOrUpdateConfSmtpCommand, ConfSmtpResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public CreateOrUpdateConfSmtpCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ConfSmtpResponseDto> Handle(CreateOrUpdateConfSmtpCommand command, CancellationToken cancellationToken)
        {
            var req = command.Request;

            var existing = await _context.ConfSmtps.FirstOrDefaultAsync(cancellationToken);

            if (existing == null)
            {
                var entity = new ConfSmtp
                {
                    Host = req.Host,
                    Port = req.Port,
                    Username = req.Username,
                    EnableSsl = req.EnableSsl,
                    SenderName = req.SenderName,
                    SenderEmail = req.SenderEmail,
                    Password = req.Password,
                    UseDefaultCredentials = req.UseDefaultCredentials,
                    LastUpdated = DateTime.UtcNow
                };

                _context.ConfSmtps.Add(entity);
                await _context.SaveChangesAsync(cancellationToken);

                return new ConfSmtpResponseDto
                {
                    Id = entity.Id,
                    Host = entity.Host,
                    Port = entity.Port,
                    Username = req.Username,
                    EnableSsl = entity.EnableSsl,
                    SenderName = entity.SenderName,
                    SenderEmail = entity.SenderEmail,
                    Password = entity.Password,
                    UseDefaultCredentials = entity.UseDefaultCredentials,
                    LastUpdated = entity.LastUpdated
                };
            }
            else
            {
                // Actualizar
                existing.Host = req.Host;
                existing.Port = req.Port;
                existing.Username = req.Username;
                existing.EnableSsl = req.EnableSsl;
                existing.SenderName = req.SenderName;
                existing.SenderEmail = req.SenderEmail;
                existing.Password = req.Password;
                existing.UseDefaultCredentials = req.UseDefaultCredentials;
                existing.LastUpdated = DateTime.UtcNow;

                _context.ConfSmtps.Update(existing);
                await _context.SaveChangesAsync(cancellationToken);

                return new ConfSmtpResponseDto
                {
                    Id = existing.Id,
                    Host = existing.Host,
                    Port = existing.Port,
                    Username = existing.Username,
                    EnableSsl = existing.EnableSsl,
                    SenderName = existing.SenderName,
                    Password = existing.Password,
                    SenderEmail = existing.SenderEmail,
                    UseDefaultCredentials = existing.UseDefaultCredentials,
                    LastUpdated = existing.LastUpdated
                };
            }
        }
    }
}