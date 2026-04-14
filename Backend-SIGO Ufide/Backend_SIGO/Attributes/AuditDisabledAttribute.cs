namespace SIGO.Api.Attributes
{
    /// <summary> 
    /// El uso de este atributo es para deshabilitar la auditoría en controladores de forma automatica
    /// Se utiliza unicamente para cuando la auditoria es manejada de forma manual 
    /// Atributo: [AuditDisabled]

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuditDisabledAttribute : Attribute
    {
    }
}
