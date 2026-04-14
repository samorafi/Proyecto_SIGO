namespace SIGO.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class HasPermissionAttribute : Attribute
    {
        public string Permission { get; }

        public HasPermissionAttribute(string permission)
        {
            Permission = permission;
        }
    }
}