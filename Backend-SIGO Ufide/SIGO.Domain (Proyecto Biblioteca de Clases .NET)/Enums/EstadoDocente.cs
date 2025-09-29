using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


//Definir los posibles estados de un docente. Esto es crucial para las futuras historias de usuario

// El namespace debe ser corto, limpio y representar su capa en la arquitectura.
namespace SIGO.Domain.Enums;

public enum EstadoDocente
{
    Activo = 1,
    Inactivo = 0
}

