
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SIGO.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace SIGO.Domain.Entities;

public class Persona
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Cedula { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public DateTime? FechaIngreso { get; set; }
    public string? Comentarios { get; set; }

    // Foreign Keys
    public int? GeneroId { get; set; }
    public int? ProvinciaId { get; set; }
    public int? CantonId { get; set; }
    public int? CategoriaId { get; set; }
    public int? EstadoPersonaId { get; set; }
    public int? TipoContratoId { get; set; }
    public int? MotivoDesvinculacionId { get; set; }
    public int? PeriodoDesvinculacionId { get; set; }

    // Navigation Properties (relaciones)
    public virtual Genero? Genero { get; set; }
    public virtual Provincia? Provincia { get; set; }
    public virtual Canton? Canton { get; set; }
    public virtual CategoriaDocente? CategoriaDocente { get; set; }
    public virtual EstadoPersona? EstadoPersona { get; set; }
    public virtual TipoContrato? TipoContrato { get; set; }
    public virtual MotivoDesvinculacion? MotivoDesvinculacion { get; set; }
    public virtual Periodo? PeriodoDesvinculacion { get; set; }
}

