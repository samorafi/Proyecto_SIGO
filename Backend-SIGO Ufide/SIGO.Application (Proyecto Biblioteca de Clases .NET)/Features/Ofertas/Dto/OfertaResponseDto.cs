using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIGO.Application.Features.Ofertas.Dto;

public class OfertaResponseDto
{
    public int OfertaId { get; set; }
    public int CursoId { get; set; }
    public int SedeId { get; set; }
    public int ModalidadId { get; set; }
    public int HorarioId { get; set; }
    public int PeriodoId { get; set; }
    public int? AccionId { get; set; }
    public int? CoordinadorId { get; set; }
    public string? Comentarios { get; set; }
}


