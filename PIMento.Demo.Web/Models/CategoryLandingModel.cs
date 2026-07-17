using System.Collections.Generic;

namespace PIMento.Demo.Web.Models
{
    public class CategoryLandingModel
    {
        public string Section { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public List<CategoryLandingCard> Cards { get; set; } = new List<CategoryLandingCard>();
    }

    public class CategoryLandingCard
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
    }
}
