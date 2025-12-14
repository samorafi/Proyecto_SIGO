// ------------------------------------------------------------
// CatalogosNormalizados.js
// Crea un set completo de funciones de normalización reutilizables.
// ------------------------------------------------------------

export const CatalogosNormalizados = (catalogos) => {
    const {
        cursos,
        sedes,
        modalidades,
        horarios,
        periodos,
        coordinadores,
        estados,
        personas
    } = catalogos;

    // ------------------ Cursos ------------------
    const matchCursoId = (valor) => {
        if (!valor) return "";
        const hit = cursos.find(c => c.codigo === valor || c.nombre === valor);
        return hit?.cursoId ?? "";
    };

    const getCursoNombrePorCodigo = (codigo) => {
        const curso = cursos.find(c => c.codigo === codigo);
        return curso ? curso.nombre : codigo;
    };

    // ------------------ Sedes ------------------
    const matchSedeId = (valor) => {
        if (!valor) return "";
        const hit = sedes.find(s => s.nombre === valor);
        return hit?.sedeId ?? "";
    };

    // ------------------ Modalidad ------------------
    const matchModalidadId = (valor) => {
        if (!valor) return "";
        const hit = modalidades.find(m => m.nombre === valor);
        return hit?.modalidadId ?? 3; // En línea por defecto
    };

    // ------------------ Horarios ------------------
    const matchHorarioId = (texto, id) => {
        if (id) return id;
        if (!texto) return "";

        const hit = horarios.find(h =>
            `${h.dia} - ${h.rango}` === texto || h.descripcion === texto
        );

        return hit?.horarioId ?? "";
    };

    const getHorarioNombre = (id) => {
        const hora = horarios.find(h => h.horarioId === id);
        return hora ? `${hora.dia} - ${hora.rango}` : id;
    };

    const diaMapeo = {
        "Lunes": "L",
        "Martes": "K",
        "Miércoles": "M",
        "Jueves": "J",
        "Viernes": "V",
        "Sábado": "S",
        "Domingo": "D"
    };

    const getDiaNombre = (id) => {
        const h = horarios.find(h => h.horarioId === id);
        if (!h) return id;
        return diaMapeo[h.dia] ?? h.dia;
    };

    const getHoraNombre = (id) => {
        const h = horarios.find(h => h.horarioId === id);
        return h ? h.rango : id;
    };

    // ------------------ Periodos ------------------
    const matchPeriodoId = (valor) => {
        if (!valor) return "";

        const byLabel = periodos.find(p =>
            [`${p.numero}C, ${p.anio}`, `${p.numero}Q - ${p.anio}`].includes(valor)
        );
        if (byLabel) return byLabel.periodoId;

        const year = valor.match(/\d{4}/)?.[0];
        const num = valor.match(/\d+/)?.[0];

        const byParts = periodos.find(
            p => String(p.anio) === year && String(p.numero) === num
        );

        return byParts?.periodoId ?? "";
    };

    // ------------------ Coordinadores ------------------
    const matchCoordinadorId = (valor) => {
        if (!valor) return "";
        const hit = coordinadores.find(c => c.nombre === valor);
        return hit?.id ?? "";
    };

    const getCoordinadorNombre = (id) =>
        coordinadores.find(c => c.id === id)?.nombre ?? id;

    const getCoordinadorPrimerApellido = (id) =>
        coordinadores.find(c => c.id === id)?.primerApellido ?? id;

    const getCoordinadorSegundoApellido = (id) =>
        coordinadores.find(c => c.id === id)?.segundoApellido ?? id;

    // ------------------ Profesores ------------------

    const matchProfesorId = (valor) => {
        if (!valor) return "";
        const hit = personas.find(
            p =>
                `${p.nombre} ${p.primerApellido} ${p.segundoApellido}`.trim() === valor
        );
        return hit?.personaId ?? "";
    };

    const getProfesorNombre = (id) =>
        personas.find(p => p.personaId === id)?.nombre ?? id;

    const getProfesorPrimerApellido = (id) =>
        personas.find(p => p.personaId === id)?.primerApellido ?? id;

    const getProfesorSegundoApellido = (id) =>
        personas.find(p => p.personaId === id)?.segundoApellido ?? id;


    // ------------------ Estados / Acción ------------------
    const matchAccionIdDesdeEstadoOAccion = (estado, accion) => {
        const nombre = estado || accion;
        if (!nombre) return 2; // Pendiente por defecto
        const hit = estados.find(e => e.nombre === nombre);
        return hit?.accionId ?? 2;
    };

    // ------------------------------------------------------------
    // Exportamos TODO
    // ------------------------------------------------------------
    return {
        matchCursoId,
        getCursoNombrePorCodigo,
        matchSedeId,
        matchModalidadId,
        matchHorarioId,
        getHorarioNombre,
        getDiaNombre,
        getHoraNombre,
        matchPeriodoId,
        matchCoordinadorId,
        getCoordinadorNombre,
        getCoordinadorPrimerApellido,
        getCoordinadorSegundoApellido,
        matchAccionIdDesdeEstadoOAccion,
        getProfesorNombre,
        getProfesorPrimerApellido,
        getProfesorSegundoApellido,
        matchProfesorId
    };
};
