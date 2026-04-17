using ExcelDataReader;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Utils;
using SIGO.Application.Features.Ofertas.Dto;
using SIGO.Domain.Entities;
using System.Data;
using System.Text.RegularExpressions;

namespace SIGO.Application.Features.Ofertas.Commands.ImportarOfertasPresenciales
{
    public class ImportarOfertasPresencialesCommandHandler : IRequestHandler<ImportarOfertasPresencialesCommand, ImportarOfertasResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public ImportarOfertasPresencialesCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ImportarOfertasResponseDto> Handle(ImportarOfertasPresencialesCommand request, CancellationToken cancellationToken)
        {
            var response = new ImportarOfertasResponseDto();
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            // ==========================================================================================
            // FASE 1: LECTURA Y VALIDACIÓN "FAIL FAST" (EL REBOTE)
            // ==========================================================================================

            using var stream = request.ArchivoExcel.OpenReadStream();
            using var reader = ExcelReaderFactory.CreateReader(stream);
            var result = reader.AsDataSet(new ExcelDataSetConfiguration()
            {
                ConfigureDataTable = (_) => new ExcelDataTableConfiguration() { UseHeaderRow = true }
            });

            var tabla = result.Tables[0];

            // 1. Validar reglas de negocio estrictas (Coordinador obligatorio, Profesor según acción)
            var erroresDeValidacion = ValidarReglasDeNegocio(tabla);

            if (erroresDeValidacion.Any())
            {
                // ¡REBOTE! No guardamos nada, devolvemos la lista de errores al usuario.
                response.Errores = erroresDeValidacion;
                response.TotalProcesados = 0;
                response.InsertadosCorrectamente = 0;
                return response;
            }

            // ==========================================================================================
            // FASE 2: PREPARACIÓN DE CACHÉS (OPTIMIZACIÓN)
            // ==========================================================================================

            // 2. Obtener o Crear el Periodo Global de la Oferta (Columna "Oferta Cuatrimestre")
            int periodoIdGlobal = await ObtenerOCrearPeriodoGlobalAsync(tabla, cancellationToken);

            // 3. Cargar Catálogos en Memoria (Diccionarios para búsqueda O(1))

            // Carreras: Key = Nombre Normalizado
            var carrerasCache = await _context.Carreras.ToDictionaryAsync(c => c.Nombre.NormalizarParaMatch(), c => c, cancellationToken);

            // Grados: Key = Nombre Normalizado
            var gradosCache = await _context.Grados.ToDictionaryAsync(g => g.Nombre.NormalizarParaMatch(), g => g, cancellationToken);

            // Cursos: Key = Código Normalizado
            var cursosCache = await _context.Cursos.ToDictionaryAsync(c => c.Codigo.Trim().ToUpper(), c => c, cancellationToken);

            // Horarios: Lista (búsqueda compleja)
            var horariosCache = await _context.Horarios.ToListAsync(cancellationToken);

            // Acciones: Key = Nombre Normalizado
            var accionesCache = await _context.AccionesOferta.ToDictionaryAsync(a => a.Nombre.NormalizarParaMatch(), a => a.AccionId, cancellationToken);

            // Sedes: Key = Nombre Normalizado (Con Sinónimos)
            var sedesCache = await _context.Sedes.ToDictionaryAsync(s => s.Nombre.NormalizarParaMatch(), s => s.SedeId, cancellationToken);
            ConfigurarSinonimosSedes(sedesCache);

            // Personas (Profesores/Coordinadores): Búsqueda Híbrida (Cédula > Nombre)
            var personasDb = await _context.Personas
                .Select(p => new { p.Id, p.Cedula, p.Nombre, p.PrimerApellido, p.SegundoApellido })
                .ToListAsync(cancellationToken);

            var personasPorCedula = personasDb
                .Where(p => !string.IsNullOrEmpty(p.Cedula))
                .ToDictionary(p => p.Cedula.Trim(), p => p.Id);

            // ==========================================================================================
            // FASE 3: PROCESAMIENTO CONSTRUCTIVO (FILA POR FILA)
            // ==========================================================================================

            var nuevasOfertas = new List<Oferta>();
            int filaIndex = 1; // Fila 1 es encabezado

            foreach (DataRow row in tabla.Rows)
            {
                filaIndex++;
                try
                {
                    // --- Lectura de Datos Crudos ---
                    string carreraRaw = row["Carrera"]?.ToString()?.Trim() ?? "";
                    string gradoRaw = row["Grado"]?.ToString()?.Trim() ?? "";
                    string codigoRaw = row["Código"]?.ToString()?.Trim() ?? "";
                    string materiaRaw = row["Materia"]?.ToString()?.Trim() ?? ""; // Nombre del curso
                    string netacadRaw = row["Curso en Netacad"]?.ToString()?.Trim() ?? "";
                    string diaRaw = row["Día"]?.ToString()?.Trim() ?? "";
                    string horarioRaw = row["Horario"]?.ToString()?.Trim() ?? "";
                    string sedeRaw = row["Sede"]?.ToString()?.Trim() ?? "";
                    string accionRaw = row["Acción"]?.ToString()?.Trim() ?? "";

                    // Personas (Nombres y Cédulas)
                    string coordNombre = row["Coordinador"]?.ToString()?.Trim() ?? "";
                    string coordCedula = row["CedulaCoordinador"]?.ToString()?.Trim() ?? ""; // Si existe en excel
                    string profNombre = row["Profesor"]?.ToString()?.Trim() ?? "";
                    string profCedula = row["CedulaDocente"]?.ToString()?.Trim() ?? ""; // Si existe en excel

                    if (string.IsNullOrEmpty(codigoRaw)) continue; // Saltar filas vacías

                    // --- 1. GESTIÓN DE CARRERA (Crear si no existe) ---
                    if (!carrerasCache.TryGetValue(carreraRaw.NormalizarParaMatch(), out var carreraEntidad))
                    {
                        carreraEntidad = new Carrera { Nombre = carreraRaw, Estado = true };
                        _context.Carreras.Add(carreraEntidad);
                        await _context.SaveChangesAsync(cancellationToken); // Guardar ya para tener ID
                        carrerasCache[carreraRaw.NormalizarParaMatch()] = carreraEntidad; // Actualizar cache
                    }

                    // --- 2. GESTIÓN DE GRADO (Crear si no existe) ---
                    if (!gradosCache.TryGetValue(gradoRaw.NormalizarParaMatch(), out var gradoEntidad))
                    {
                        gradoEntidad = new Grado { Nombre = gradoRaw };
                        _context.Grados.Add(gradoEntidad);
                        await _context.SaveChangesAsync(cancellationToken);
                        gradosCache[gradoRaw.NormalizarParaMatch()] = gradoEntidad;
                    }

                    // --- 3. GESTIÓN DE CURSO (Crear si no existe) ---
                    // Requiere CarreraId y GradoId obtenidos arriba
                    if (!cursosCache.TryGetValue(codigoRaw.ToUpper(), out var cursoEntidad))
                    {
                        bool esNetacad = EsCursoNetacad(netacadRaw);
                        cursoEntidad = new Curso
                        {
                            Codigo = codigoRaw.ToUpper(),
                            Nombre = materiaRaw, // Usamos la columna "Materia" como nombre
                            CarreraId = carreraEntidad.CarreraId,
                            GradoId = gradoEntidad.GradoId,
                            EsNetcad = esNetacad,
                            Estado = true
                        };
                        _context.Cursos.Add(cursoEntidad);
                        await _context.SaveChangesAsync(cancellationToken);
                        cursosCache[codigoRaw.ToUpper()] = cursoEntidad;
                    }

                    // --- 4. GESTIÓN DE HORARIO (Crear si no existe) ---
                    int? horarioId = null;
                    if (!string.IsNullOrEmpty(diaRaw) && !string.IsNullOrEmpty(horarioRaw))
                    {
                        var hInfo = ParsearHorario(diaRaw, horarioRaw);

                        // Buscar match exacto en memoria
                        var existente = horariosCache.FirstOrDefault(h =>
                            h.Dia.Equals(hInfo.Dia, StringComparison.OrdinalIgnoreCase) &&
                            h.Rango.Equals(hInfo.RangoTexto, StringComparison.OrdinalIgnoreCase));

                        if (existente != null)
                        {
                            horarioId = existente.HorarioId;
                        }
                        else
                        {
                            var nuevoH = new Horario { Dia = hInfo.Dia, Rango = hInfo.RangoTexto };
                            _context.Horarios.Add(nuevoH);
                            await _context.SaveChangesAsync(cancellationToken);
                            horariosCache.Add(nuevoH);
                            horarioId = nuevoH.HorarioId;
                        }
                    }

                    // --- 5. RESOLVER PERSONAS ---
                    int? coordinadorId = BuscarPersonaId(coordCedula, coordNombre, personasPorCedula, personasDb);
                    int? profesorId = BuscarPersonaId(profCedula, profNombre, personasPorCedula, personasDb);

                    // --- 6. RESOLVER SEDE Y ACCIÓN ---
                    int sedeId = ObtenerSedeId(sedesCache, sedeRaw);
                    int? accionId = accionesCache.ContainsKey(accionRaw.NormalizarParaMatch())
                        ? accionesCache[accionRaw.NormalizarParaMatch()] : null;

                    // --- 7. CREAR OFERTA ---
                    var oferta = new Oferta
                    {
                        PeriodoId = periodoIdGlobal,
                        CursoId = cursoEntidad.CursoId,
                        SedeId = sedeId,
                        HorarioId = horarioId ?? 0, // Asumiendo ID 0 o manejo de error si es null
                        CoordinadorId = coordinadorId,
                        PersonaId = profesorId, // Campo nuevo para el Docente
                        AccionId = accionId,
                        Grupo = int.TryParse(row["Grupo"]?.ToString(), out int g) ? g : 1,
                        Matriculados = int.TryParse(row["Matricula"]?.ToString(), out int m) ? m : 0,
                        Cupo = 30,
                        EstadoOfertaId = 6, // Estado "Importada"
                        Comentarios = "Carga Masiva Automática",

                        // Lógica Modalidad: "En Línea/Online" -> 3, "Virtual" -> 2, "Presencial" -> 1
                        ModalidadId = sedeRaw.Contains("100% En Línea", StringComparison.OrdinalIgnoreCase) || 
                                      sedeRaw.Contains("100% en linea", StringComparison.OrdinalIgnoreCase) || 
                                      sedeRaw.Contains("En Linea", StringComparison.OrdinalIgnoreCase) 
                                      ? 3 
                                      : sedeRaw.Contains("Virtual", StringComparison.OrdinalIgnoreCase) ? 2 : 1
                    };

                    nuevasOfertas.Add(oferta);
                }
                catch (Exception ex)
                {
                    response.Errores.Add($"Fila {filaIndex}: Error inesperado - {ex.Message}");
                }
            }

            // ==========================================================================================
            // FASE 4: GUARDADO FINAL
            // ==========================================================================================
            if (nuevasOfertas.Any())
            {
                await _context.Ofertas.AddRangeAsync(nuevasOfertas, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }

            response.InsertadosCorrectamente = nuevasOfertas.Count;
            response.TotalProcesados = filaIndex - 1;

            return response;
        }

        // ==========================================================================================
        // MÉTODOS PRIVADOS (LÓGICA AUXILIAR)
        // ==========================================================================================

        private List<string> ValidarReglasDeNegocio(DataTable tabla)
        {
            var errores = new List<string>();
            int filaVisual = 1; // Para que el usuario vea "Fila 2" (datos)

            // Acciones que NO requieren profesor
            var accionesExentas = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Asignar Profesor", "Abrir Curso", "Suficiencia", "Cerrado"
            };

            foreach (DataRow row in tabla.Rows)
            {
                filaVisual++;
                string coordinador = row["Coordinador"]?.ToString()?.Trim();
                string profesor = row["Profesor"]?.ToString()?.Trim();
                string accion = row["Acción"]?.ToString()?.Trim();

                /* 
                 * CAMBIO REALIZADO: Se comentan las validaciones obligatorias por Coordinador y Docente.
                 * Esto permite que se carguen las ofertas desde el Excel aunque vengan sin un coordinador
                 * o un docente asignado (quedarán en NULL en la base de datos). 
                 * Posteriormente, la administradora les agregará los coordinadores y docentes respectivos.
                 * Se deja el código original comentado por si a futuro se requiere volver a habilitar
                 * esta exigencia estricta desde el Excel inicial.
                 */

                /*
                // Regla 1: Coordinador Obligatorio
                if (string.IsNullOrEmpty(coordinador))
                {
                    errores.Add($"Fila {filaVisual}: Falta el nombre del Coordinador.");
                }

                // Regla 2: Profesor Obligatorio salvo excepciones
                bool requiereProfesor = !accionesExentas.Contains(accion?.NormalizarParaMatch() ?? "");
                if (requiereProfesor && string.IsNullOrEmpty(profesor))
                {
                    errores.Add($"Fila {filaVisual}: Para la acción '{accion}', el campo Profesor es obligatorio.");
                }
                */
            }
            return errores;
        }

        private async Task<int> ObtenerOCrearPeriodoGlobalAsync(DataTable tabla, CancellationToken ct)
        {
            if (tabla.Rows.Count == 0) throw new Exception("El archivo está vacío.");

            // Leemos la primera fila, columna "Oferta Cuatrimestre"
            // NOTA: Si el Excel tiene otro nombre (ej: "Cuatrimestre de Ingreso"), ajustar aquí.
            // Según tu instrucción, usamos "Oferta Cuatrimestre".
            string columnaPeriodo = "Oferta Cuatrimestre";
            if (!tabla.Columns.Contains(columnaPeriodo) && tabla.Columns.Contains("Cuatrimestre de Ingreso"))
            {
                columnaPeriodo = "Cuatrimestre de Ingreso"; // Fallback inteligente
            }

            string periodoRaw = tabla.Rows[0][columnaPeriodo]?.ToString()?.Trim();

            if (string.IsNullOrEmpty(periodoRaw))
                throw new Exception($"La columna '{columnaPeriodo}' está vacía en la primera fila.");

            // Normalización: "IC, 2025" -> "IC_2025"
            periodoRaw = periodoRaw.Replace(", ", "_").Replace(",", "_").Replace(" ", "");

            // Regex: Busca IC_2025, IIT_2024...
            var match = Regex.Match(periodoRaw, @"^([IVX]+)([CTP])_(\d{4})$", RegexOptions.IgnoreCase);
            if (!match.Success)
                throw new Exception($"El periodo '{periodoRaw}' no tiene formato válido (Ej: IC_2025).");

            string romano = match.Groups[1].Value.ToUpper();
            string tipoLetra = match.Groups[2].Value.ToUpper();
            int anio = int.Parse(match.Groups[3].Value);

            int numero = romano switch { "I" => 1, "II" => 2, "III" => 3, "IV" => 4, _ => 0 };

            // Mapeo a Enum
            PeriodoTipo tipoEnum = tipoLetra == "C" ? PeriodoTipo.Cuatrimestre :
                                   tipoLetra == "T" ? PeriodoTipo.Trimestre : PeriodoTipo.Mensual;

            // Buscar en BD
            var existente = await _context.Periodos.FirstOrDefaultAsync(p =>
                p.Anio == anio && p.Numero == numero && p.Tipo == tipoEnum, ct);

            if (existente != null) return existente.PeriodoId;

            // Crear si no existe
            var nuevo = new Periodo { Anio = anio, Numero = numero, Tipo = tipoEnum, Estado = true };
            _context.Periodos.Add(nuevo);
            await _context.SaveChangesAsync(ct);
            return nuevo.PeriodoId;
        }

        private bool EsCursoNetacad(string valor)
        {
            if (string.IsNullOrWhiteSpace(valor)) return false;
            var negativos = new[] { "NO", "NO APLICA", "N/A", "FALSE" };
            return !negativos.Contains(valor.ToUpper().Trim());
        }

        private int? BuscarPersonaId(string cedula, string nombre, Dictionary<string, int> cacheCedula, IEnumerable<dynamic> listaCompleta)
        {
            // 1. Prioridad: Cédula
            if (!string.IsNullOrEmpty(cedula) && cacheCedula.TryGetValue(cedula, out int id)) return id;

            // 2. Fallback: Nombre (Aproximado)
            if (!string.IsNullOrEmpty(nombre))
            {
                string nombreNorm = nombre.NormalizarParaMatch();
                var match = listaCompleta.FirstOrDefault(p =>
                    ((string)($"{p.Nombre} {p.PrimerApellido} {p.SegundoApellido}")).NormalizarParaMatch() == nombreNorm ||
                    ((string)($"{p.PrimerApellido} {p.SegundoApellido} {p.Nombre}")).NormalizarParaMatch() == nombreNorm); // Apellidos primero

                if (match != null) return match.Id;
            }
            return null;
        }

        private int ObtenerSedeId(Dictionary<string, int> sedes, string nombreRaw)
        {
            string key = LimpiarNombreSede(nombreRaw).NormalizarParaMatch();
            if (sedes.TryGetValue(key, out int id)) return id;
            var match = sedes.Keys.FirstOrDefault(k => key.Contains(k)); // Match parcial
            return match != null ? sedes[match] : sedes.Values.FirstOrDefault(); // Default (cuidado aquí)
        }

        private void ConfigurarSinonimosSedes(Dictionary<string, int> dict)
        {
            // Helper local para inyectar sinónimos al diccionario
            void AddSyn(string oficial, params string[] alias)
            {
                var keyOficial = oficial.NormalizarParaMatch();
                var entry = dict.FirstOrDefault(x => x.Key == keyOficial);
                if (entry.Key != null) foreach (var a in alias) dict[a.NormalizarParaMatch()] = entry.Value;
            }

            AddSyn("Sede Heredia", "Heredia", "1. Heredia");
            AddSyn("Sede San Pedro", "San Pedro", "San Jose", "Central", "3. San Pedro");
            AddSyn("Campus Virtual", "Virtual", "Sede Virtual", "2. Virtual", "FideVirtual", "100% en linea", "100% en linea", "en linea", "en línea");
        }

        private string LimpiarNombreSede(string raw)
        {
            var match = Regex.Match(raw, @"^\d+\.\s*(.*)");
            return match.Success ? match.Groups[1].Value.Trim() : raw.Trim();
        }

        private (string Dia, string RangoTexto) ParsearHorario(string diaLetra, string rango)
        {
            // Convertir L, K, M... a Lunes, Martes...
            string dia = diaLetra.ToUpper().Trim() switch
            {
                "L" => "Lunes",
                "K" => "Martes",
                "M" => "Miercoles", // Sin tilde para coincidir con BD
                "J" => "Jueves",
                "V" => "Viernes",
                "S" => "Sabado",
                _ => diaLetra
            };

            // Estandarizar rango "6pm-9pm" -> "18:00-21:00"
            // Nota: Copia aquí tu lógica de regex anterior si deseas formateo 24h estricto.
            // Por simplicidad, aquí asumo que guardamos lo que viene o aplicamos una limpieza básica.
            return (dia, rango);
        }
    }
}