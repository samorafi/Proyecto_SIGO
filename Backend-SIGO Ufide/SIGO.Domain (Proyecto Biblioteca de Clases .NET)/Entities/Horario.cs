namespace SIGO.Domain.Entities;

public class Horario
{
    public int HorarioId { get; set; }
    public string Dia { get; set; } = null!;
    public string Rango { get; set; } = null!;
}
