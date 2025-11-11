namespace SIGO.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuditAttribute : Attribute
    {
        public string? Descripcion { get; set; }
        public AuditAttribute(string? descripcion = null)
        {
            Descripcion = descripcion;
        }
    }

}
