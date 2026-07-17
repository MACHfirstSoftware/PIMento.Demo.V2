using PHXCOM.PlatformSDK.Models;
using System.Collections.Generic;

namespace PHXCOM.VehiclesDemo.Web.Models
{
    public class CategoryParent
    {
        public int Id { get; set; }
        public string ParentName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AltDescription { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;
        public ICollection<Category> ChildCategories { get; set; } = new List<Category>();
    }
}
