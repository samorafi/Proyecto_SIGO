namespace SIGO.Api.Attributes

    /// <summary> 
    /// El uso de este atributo es para auditar los procesos en los controladores de forma automatica
    /// Atributo: [Audit]
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
