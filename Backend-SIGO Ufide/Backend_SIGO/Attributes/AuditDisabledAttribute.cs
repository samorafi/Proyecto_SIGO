namespace SIGO.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuditDisabledAttribute : Attribute
    {
    }
}
