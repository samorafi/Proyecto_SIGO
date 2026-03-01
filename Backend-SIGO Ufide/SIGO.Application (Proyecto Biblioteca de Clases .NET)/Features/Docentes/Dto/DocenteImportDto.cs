namespace SIGO.Application.Features.Docentes.Dto
{
    public class DocenteImportDto //Representa una fila del Excel. Es un DTO plano para recibir los datos crudos.
    {
        // Mapeo directo de columnas del Excel
        public string Nombre { get; set; } = string.Empty;
        public string Cedula { get; set; } = string.Empty;
        public string Genero { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;

        // Ubicación
        public string Provincia { get; set; } = string.Empty;
        public string Canton { get; set; } = string.Empty;

        // Datos Laborales/Académicos
        public string Categoria { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string Ingreso { get; set; } = string.Empty;
        public string Contratacion { get; set; } = string.Empty;
        public string Atestados { get; set; } = string.Empty;
        public string Sede { get; set; } = string.Empty;

        // Datos de Salida (Opcionales)
        public string? MotivoDesvinculacion { get; set; }
        public string? CuatrimestreDesvinculacion { get; set; }
        public string? Comentarios { get; set; }
    }
}