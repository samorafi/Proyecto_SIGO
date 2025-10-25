using MediatR;
using SIGO.Application.Features.ConfigSmtp.DTO;

namespace SIGO.Application.Features.ConfigSmtp.Queries.Get
{
    public class GetConfSmtpQuery : IRequest<ConfSmtpResponseDto>
    {
    }
}
