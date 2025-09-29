using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SIGO.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SIGO.Domain.Entities { 
public class Canton
{
    public int CantonId { get; set; }
    public string Nombre { get; set; } = string.Empty;

    // Clave Foránea (FK) hacia Provincia
    public int ProvinciaId { get; set; }

    // Propiedad de navegación: Un cantón pertenece a una provincia
    public Provincia Provincia { get; set; } = null!;
}
}