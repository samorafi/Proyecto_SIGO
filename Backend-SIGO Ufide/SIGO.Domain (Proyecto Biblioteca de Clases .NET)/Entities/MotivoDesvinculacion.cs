﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace SIGO.Domain.Entities
{
    public class MotivoDesvinculacion
    {
        public int MotivoDesvinculacionId { get; set; }
        public string Nombre { get; set; } = string.Empty;
    }
}
