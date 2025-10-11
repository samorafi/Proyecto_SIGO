namespace SIGO.Domain.Entities;

public class Carrera
{
    public int CarreraId { get; set; }
    public string Nombre { get; set; } = null!;
    public bool Estado { get; set; } = true;
}
