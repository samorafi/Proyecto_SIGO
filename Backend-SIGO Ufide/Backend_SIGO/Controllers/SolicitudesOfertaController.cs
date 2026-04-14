using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.SolicitudesOferta.Commands.Enviar;
using SIGO.Application.Features.SolicitudesOferta.Commands.Responder;

namespace SIGO.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SolicitudesOfertaController : ControllerBase
{
    private readonly IMediator _mediator;

    public SolicitudesOfertaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<int>> Enviar(
        [FromBody] EnviarSolicitudOfertaRequest request,
        CancellationToken ct)
    {
        if (request is null)
            return BadRequest("Los datos de la solicitud son requeridos.");

        try
        {
            var id = await _mediator.Send(new EnviarSolicitudOfertaCommand(request), ct);
            return Ok(id);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("responder")]
    public async Task<IActionResult> Responder(
        [FromQuery] string token,
        [FromQuery] string accion,
        CancellationToken ct)
    {
        var mensaje = await _mediator.Send(
            new ResponderSolicitudOfertaCommand(token, accion), ct);

        var html = $@"
            <!DOCTYPE html>
            <html lang=""es"">
            <head>
                <meta charset=""utf-8"" />
                <title>Respuesta oferta</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                    }}
                    .card {{
                        max-width: 480px;
                        margin: 80px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        padding: 24px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        text-align: center;
                    }}
                    h1 {{
                        color: #2B338C;
                        font-size: 20px;
                        margin-bottom: 16px;
                    }}
                    p {{
                        color: #333333;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class=""card"">
                    <h1>Respuesta registrada</h1>
                    <p>{System.Net.WebUtility.HtmlEncode(mensaje)}</p>
                </div>
            </body>
            </html>";

        return Content(html, "text/html; charset=utf-8");
    }
}
