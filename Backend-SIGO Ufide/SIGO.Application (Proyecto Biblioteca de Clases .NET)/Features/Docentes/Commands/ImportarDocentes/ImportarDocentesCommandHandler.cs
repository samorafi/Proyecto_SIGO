using ExcelDataReader;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SIGO.Application.Abstractions;
using SIGO.Application.Common.Utils;
using SIGO.Application.Features.Docentes.Dto;
using SIGO.Domain.Entities;
using System.Data;
using System.Text.RegularExpressions;

using PersonaEntity = SIGO.Domain.Entities.Persona;

namespace SIGO.Application.Features.Docentes.Commands.ImportarDocentes
{
    public class ImportarDocentesCommandHandler : IRequestHandler<ImportarDocentesCommand, ImportarDocentesResponseDto>
    {
        private readonly IApplicationDbContext _context;

        public ImportarDocentesCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ImportarDocentesResponseDto> Handle(ImportarDocentesCommand request, CancellationToken cancellationToken)
        {
            var response = new ImportarDocentesResponseDto();
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            // ========================================================================
            // 1. CARGA DE CATÁLOGOS
            // ========================================================================
            Dictionary<string, int> CrearDiccionario(IEnumerable<dynamic> lista)
            {
                return lista.ToDictionary(k => ((string)k.Nombre).NormalizarParaMatch(), v => (int)v.Id);
            }

            var generos = CrearDiccionario(await _context.Generos.Select(x => new { x.Nombre, Id = x.GeneroId }).ToListAsync(cancellationToken));
            var provincias = CrearDiccionario(await _context.Provincias.Select(x => new { x.Nombre, Id = x.ProvinciaId }).ToListAsync(cancellationToken));
            var categorias = CrearDiccionario(await _context.CategoriasDocentes.Select(x => new { x.Nombre, Id = x.CategoriaId }).ToListAsync(cancellationToken));
            var atestados = CrearDiccionario(await _context.Atestados.Select(x => new { x.Nombre, Id = x.AtestadoId }).ToListAsync(cancellationToken));
            var estados = CrearDiccionario(await _context.EstadosPersonas.Select(x => new { x.Nombre, Id = x.EstadoPersonaId }).ToListAsync(cancellationToken));
            var contratos = CrearDiccionario(await _context.TiposContratos.Select(x => new { x.Nombre, Id = x.TipoContratoId }).ToListAsync(cancellationToken));
            var motivos = CrearDiccionario(await _context.MotivosDesvinculacion.Select(x => new { x.Nombre, Id = x.MotivoDesvinculacionId }).ToListAsync(cancellationToken));

            // --- CARGA Y MAPEO INTELIGENTE DE SEDES ---
            var sedes = CrearDiccionario(await _context.Sedes.Select(x => new { x.Nombre, Id = x.SedeId }).ToListAsync(cancellationToken));

            // Lógica de Sinónimos: Si el Excel trae "Central", lo mapeamos al ID de "Sede San Pedro"
            AgregarSinonimos(sedes, "Sede San Pedro", "Central", "San José", "San Jose", "Sede Central");
            AgregarSinonimos(sedes, "Sede Heredia", "Heredia");
            AgregarSinonimos(sedes, "Campus Virtual", "Virtual", "Sede Virtual");

            var cantonesDb = await _context.Cantones
                .Select(c => new { Id = c.CantonId, c.Nombre, c.ProvinciaId })
                .ToListAsync(cancellationToken);

            // --- CARGA DE PERIODOS ---
            var periodosDb = await _context.Periodos.ToListAsync(cancellationToken);
            var periodosCache = periodosDb.ToDictionary(
                k => $"{MapearTipoPeriodoAString(k.Tipo)}-{k.Numero}-{k.Anio}",
                v => v.PeriodoId
            );

            var cedulasExistentes = await _context.Personas.Select(p => p.Cedula).ToHashSetAsync(cancellationToken);
            var correosExistentes = await _context.Personas.Select(p => p.Correo).ToHashSetAsync(cancellationToken);

            var nuevosDocentes = new List<PersonaEntity>();

            // ========================================================================
            // 2. LECTURA Y PROCESAMIENTO
            // ========================================================================
            using (var stream = request.ArchivoExcel.OpenReadStream())
            using (var reader = ExcelReaderFactory.CreateReader(stream))
            {
                var result = reader.AsDataSet(new ExcelDataSetConfiguration() { ConfigureDataTable = (_) => new ExcelDataTableConfiguration() { UseHeaderRow = true } });
                var tabla = result.Tables[0];
                int filaIndex = 1;

                foreach (DataRow row in tabla.Rows)
                {
                    filaIndex++;
                    try
                    {
                        string cedula = row["Cédula"]?.ToString()?.Trim() ?? "";
                        string correo = row["Correo Electrónico"]?.ToString()?.Trim() ?? "";
                        string nombreCompleto = row["Nombre"]?.ToString()?.Trim() ?? "";

                        if (string.IsNullOrEmpty(cedula) || string.IsNullOrEmpty(nombreCompleto)) continue;
                        if (cedulasExistentes.Contains(cedula)) continue;

                        var docente = new PersonaEntity
                        {
                            Cedula = cedula,
                            Correo = correo,
                            Telefono = row["Teléfono"]?.ToString()?.Trim(),
                            Comentarios = row["Comentarios"]?.ToString(),
                            RolDocenteId = 1
                        };

                        ProcesarNombre(nombreCompleto, docente);

                        // --- PERIODOS ---
                        string ingresoRaw = row["Ingreso"]?.ToString()?.Trim();
                        if (!string.IsNullOrEmpty(ingresoRaw))
                        {
                            int? periodoId = await ObtenerOCrearPeriodoAsync(ingresoRaw, periodosCache, cancellationToken);
                            if (periodoId.HasValue) docente.PeriodoIngresoId = periodoId.Value;
                            else response.Errores.Add($"Fila {filaIndex}: Periodo '{ingresoRaw}' inválido.");
                        }

                        // --- MAPEO DE CATALOGOS ---
                        if (generos.TryGetValue(row["Género"]?.ToString().NormalizarParaMatch(), out int genId)) docente.GeneroId = genId;
                        if (categorias.TryGetValue(row["Categoría"]?.ToString().NormalizarParaMatch(), out int catId)) docente.CategoriaId = catId;
                        if (estados.TryGetValue(row["Estado"]?.ToString().NormalizarParaMatch(), out int estId)) docente.EstadoPersonaId = estId;
                        if (contratos.TryGetValue(row["Contratación"]?.ToString().NormalizarParaMatch(), out int conId)) docente.TipoContratoId = conId;
                        if (atestados.TryGetValue(row["Atestados"]?.ToString().NormalizarParaMatch(), out int ateId)) docente.AtestadoId = ateId;

                        // Aquí "Central" ya funcionará porque lo agregamos al diccionario 'sedes' arriba
                        if (sedes.TryGetValue(row["Sede"]?.ToString().NormalizarParaMatch(), out int sedeId)) docente.SedeId = sedeId;

                        string provRaw = row["Provincia"]?.ToString().NormalizarParaMatch();
                        if (provincias.TryGetValue(provRaw, out int provId))
                        {
                            docente.ProvinciaId = provId;
                            string cantonRaw = row["Cantón"]?.ToString().NormalizarParaMatch();
                            var cantonMatch = cantonesDb.FirstOrDefault(c => c.ProvinciaId == provId && c.Nombre.NormalizarParaMatch() == cantonRaw);
                            if (cantonMatch != null) docente.CantonId = cantonMatch.Id;
                        }

                        nuevosDocentes.Add(docente);
                        cedulasExistentes.Add(cedula);
                    }
                    catch (Exception ex)
                    {
                        response.Errores.Add($"Fila {filaIndex}: Error inesperado - {ex.Message}");
                    }
                }
            }

            // 3. PERSISTENCIA
            if (nuevosDocentes.Any())
            {
                await _context.Personas.AddRangeAsync(nuevosDocentes, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }

            response.TotalProcesados = response.Errores.Count + nuevosDocentes.Count;
            response.InsertadosCorrectamente = nuevosDocentes.Count;

            return response;
        }

        // --- MÉTODOS PRIVADOS ---

        // Función para inyectar sinónimos al diccionario de búsqueda
        private void AgregarSinonimos(Dictionary<string, int> diccionario, string nombreOficialEnBd, params string[] sinonimos)
        {
            // 1. Buscamos el ID del nombre oficial ("SEDE SAN PEDRO")
            string keyOficial = nombreOficialEnBd.NormalizarParaMatch();

            if (diccionario.TryGetValue(keyOficial, out int id))
            {
                // 2. Si existe, registramos todos sus apodos apuntando al mismo ID
                foreach (var alias in sinonimos)
                {
                    string keyAlias = alias.NormalizarParaMatch(); // "CENTRAL", "SAN JOSE"...
                    if (!diccionario.ContainsKey(keyAlias))
                    {
                        diccionario[keyAlias] = id;
                    }
                }
            }
        }

        private void ProcesarNombre(string nombreCompleto, PersonaEntity docente)
        {
            if (string.IsNullOrWhiteSpace(nombreCompleto)) return;
            var partes = nombreCompleto.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (partes.Length >= 3)
            {
                docente.PrimerApellido = partes[0];
                docente.SegundoApellido = partes[1];
                docente.Nombre = string.Join(" ", partes.Skip(2));
            }
            else
            {
                docente.Nombre = nombreCompleto;
                docente.PrimerApellido = ".";
            }
        }

        private string MapearTipoPeriodoAString(PeriodoTipo tipo)
        {
            return tipo switch
            {
                PeriodoTipo.Cuatrimestre => "C",
                PeriodoTipo.Trimestre => "T",
                PeriodoTipo.Mensual => "P",
                _ => "?"
            };
        }

        private PeriodoTipo MapearStringATipoPeriodo(string letra)
        {
            return letra.ToUpper() switch
            {
                "C" => PeriodoTipo.Cuatrimestre,
                "T" => PeriodoTipo.Trimestre,
                "P" => PeriodoTipo.Mensual,
                _ => throw new Exception($"Tipo de periodo desconocido: {letra}")
            };
        }

        private async Task<int?> ObtenerOCrearPeriodoAsync(string textoRaw, Dictionary<string, int> cache, CancellationToken ct)
        {
            var match = Regex.Match(textoRaw.ToUpper(), @"^([IVX]+)([CTP])_(\d{4})$");

            if (!match.Success) return null;

            string romano = match.Groups[1].Value;
            string tipoLetra = match.Groups[2].Value;
            string anioStr = match.Groups[3].Value;

            if (!int.TryParse(anioStr, out int anio)) return null;

            int numero = romano switch
            {
                "I" => 1,
                "II" => 2,
                "III" => 3,
                "IV" => 4,
                "V" => 5,
                "VI" => 6,
                "VII" => 7,
                "VIII" => 8,
                "IX" => 9,
                "X" => 10,
                "XI" => 11,
                "XII" => 12,
                _ => 0
            };

            if (numero == 0) return null;
            if (tipoLetra == "C" && numero > 3) return null;
            if (tipoLetra == "T" && numero > 4) return null;

            string key = $"{tipoLetra}-{numero}-{anio}";

            if (cache.TryGetValue(key, out int idExistente)) return idExistente;

            try
            {
                PeriodoTipo tipoEnum = MapearStringATipoPeriodo(tipoLetra);
                var nuevoPeriodo = new Periodo { Anio = anio, Numero = numero, Tipo = tipoEnum, Estado = true };
                _context.Periodos.Add(nuevoPeriodo);
                await _context.SaveChangesAsync(ct);
                cache[key] = nuevoPeriodo.PeriodoId;
                return nuevoPeriodo.PeriodoId;
            }
            catch { return null; }
        }
    }
}