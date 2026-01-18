using MediatR;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.Nomina.Commands.GenerarNominaExcel;
using SIGO.Application.Features.Nomina.Commands.GenerarNominaPdf;
using SIGO.Application.Features.Permanencia4.Commands.GenerarPermanencia4Excel;
using SIGO.Application.Features.Permanencia4.Commands.GenerarPermanencia4Pdf;

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

        // ===== PERMANENCIA +4 =====

        [HttpPost("docentes/permanencia4/excel")]
        public async Task<IActionResult> ExportarPermanencia4Excel([FromBody] GenerarPermanencia4ExcelCommand command, CancellationToken ct)
        {
            var file = await _mediator.Send(command, ct);
            return File(file.Content, file.ContentType, file.FileName);
        }

        [HttpPost("docentes/permanencia4/pdf")]
        public async Task<IActionResult> ExportarPermanencia4Pdf([FromBody] GenerarPermanencia4PdfCommand command, CancellationToken ct)
        {
            var file = await _mediator.Send(command, ct);
            return File(file.Content, file.ContentType, file.FileName);
        }
    }
}
