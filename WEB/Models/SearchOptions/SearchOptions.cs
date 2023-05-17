namespace WEB.Models
{
    public class SearchOptions
    {
        public SearchOptions()
        {
            PageIndex = 0;
            PageSize = 10;
            OrderBy = null;
            OrderByAscending = true;
        }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public string OrderBy { get; set; }
        public bool OrderByAscending { get; set; }
        public bool IncludeParents { get; set; } = false;
        public bool IncludeChildren { get; set; } = false;
    }

}
