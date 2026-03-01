using MediatR;
using SIGO.Application.Features.ConfigSmtp.DTO;

namespace SIGO.Application.Features.ConfigSmtp.Commands.CreateOrUpdate
{
    public class CreateOrUpdateConfSmtpCommand : IRequest<ConfSmtpResponseDto>
    {
        public CreateConfSmtpRequest Request { get; set; }

        public CreateOrUpdateConfSmtpCommand(CreateConfSmtpRequest request)
        {
            Request = request;
        }
    }
}
