namespace SIGO.Application.Features.Docentes.Dto

{
    public class ImportarDocentesResponseDto  //Para devolver el resumen del proceso (cuántos se insertaron, lista de errores, etc.).
    {
        public int TotalProcesados { get; set; }
        public int InsertadosCorrectamente { get; set; }
        public int ErroresCount => Errores.Count;
        public List<string> Errores { get; set; } = new List<string>();
    }
}