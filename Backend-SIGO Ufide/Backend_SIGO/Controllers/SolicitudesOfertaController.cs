using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIGO.Application.Features.SolicitudesOferta.Commands.Enviar;
using SIGO.Application.Features.SolicitudesOferta.Commands.Responder;

namespace SIGO.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SolicitudesOfertaController : ControllerBase
{
    private readonly IMediator _mediator;

    public SolicitudesOfertaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Endpoint que usa el front para enviar una oferta a un docente.
    /// POST /api/SolicitudesOferta
    /// Body: { "ofertaId": 123, "personaId": 456 }
    /// </summary>
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
            // devolvemos 200 OK con el id de la solicitud creada
            return Ok(id);
        }
        catch (InvalidOperationException ex)
        {
            // Errores de negocio (oferta no existe, docente sin correo, duplicado, etc.)
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Endpoint que usa el docente desde el correo para aceptar o rechazar la oferta.
    /// Ejemplo:
    /// GET /api/SolicitudesOferta/responder?token=...&accion=aceptar
    /// </summary>
    [HttpGet("responder")]
    [AllowAnonymous] // IMPORTANTE: para que funcione sin login
    public async Task<IActionResult> Responder(
        [FromQuery] string token,
        [FromQuery] string accion,
        CancellationToken ct)
    {
        var mensaje = await _mediator.Send(
            new ResponderSolicitudOfertaCommand(token, accion), ct);

        // Devolvemos un HTML sencillito que el profe vea en el navegador
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
