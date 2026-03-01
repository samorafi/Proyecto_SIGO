namespace SIGO.Application.Models.Common
{
    public class PagedResponse<T>
    {
        public int Page { get; set; }

        public int PageSize { get; set; }

        public long Total { get; set; }

        public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    }
}
