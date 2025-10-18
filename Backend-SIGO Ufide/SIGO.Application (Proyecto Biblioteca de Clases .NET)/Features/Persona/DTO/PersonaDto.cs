using SIGO.Domain.Entities;
using System;

namespace SIGO.Application.Features.Persona.DTO
{
    public class PersonaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Cedula { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public DateTime? FechaIngreso { get; set; }
        public string? Comentarios { get; set; }

        public string? Genero { get; set; }
        public string? Provincia { get; set; }
        public string? Canton { get; set; }
        public string? Categoria { get; set; }
        public string? Atestado { get; set; }
        public string? Estado { get; set; }
        public string? TipoContrato { get; set; }
        public string? RolDocente { get; set; }
        public int? EstadoPersonaId { get; set; }
        public int? MotivoDesvinculacionId { get; set; }
        public int? PeriodoDesvinculacionId { get; set; }
        public bool EnLinea { get; set; }


        public static PersonaDto FromEntity(Domain.Entities.Persona persona)
        {
            return new PersonaDto
            {
                Id = persona.Id,
                Nombre = persona.Nombre,
                Cedula = persona.Cedula,
                Correo = persona.Correo,
                Telefono = persona.Telefono,
                FechaIngreso = persona.FechaIngreso,
                Comentarios = persona.Comentarios,
                Genero = persona.Genero?.Nombre,
                Provincia = persona.Provincia?.Nombre,
                Canton = persona.Canton?.Nombre,
                Categoria = persona.CategoriaDocente?.Nombre,
                Atestado = persona.Atestado?.Nombre,
                Estado = persona.EstadoPersona?.Nombre,
                TipoContrato = persona.TipoContrato?.Nombre,
                RolDocente = persona.RolDocente?.Nombre,
                EstadoPersonaId = persona.EstadoPersonaId,
                MotivoDesvinculacionId = persona.MotivoDesvinculacionId,
                PeriodoDesvinculacionId = persona.PeriodoDesvinculacionId,
                EnLinea = persona.EnLinea
            };
        }
    }
}
