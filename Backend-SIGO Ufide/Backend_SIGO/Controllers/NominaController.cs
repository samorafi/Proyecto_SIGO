using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Nomina.Commands.GenerarNominaExcel;
using SIGO.Application.Features.Nomina.Commands.GenerarNominaPdf;

namespace SIGO.Api.Controllers
{
    [ApiController]
    [Route("api/nomina")]
    public class NominaController : ControllerBase
    {
        private readonly IMediator _mediator;
        public NominaController(IMediator mediator) => _mediator = mediator;

        [HttpPost("docentes/excel")]
        public async Task<IActionResult> ExportarExcel([FromBody] GenerarNominaExcelCommand command, CancellationToken ct)
        {
            var file = await _mediator.Send(command, ct);
            return File(file.Content, file.ContentType, file.FileName);
        }

        [HttpPost("docentes/pdf")]
        public async Task<IActionResult> ExportarPdf([FromBody] GenerarNominaPdfCommand command, CancellationToken ct)
        {
            var file = await _mediator.Send(command, ct);
            return File(file.Content, file.ContentType, file.FileName);
        }

    }
}
