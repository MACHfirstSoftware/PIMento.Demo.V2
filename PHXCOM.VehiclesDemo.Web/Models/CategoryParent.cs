using PHXCOM.PlatformSDK.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PHXCOM.VehiclesDemo.Web.Models
{
    public class CategoryParent
    {
        public int Id { get; set; }
        public string ParentName { get; set; }
        public string Description { get; set; }
        public string AltDescription { get; set; }

        public string Slug { get; set; }
        public ICollection<Category> ChildCategories { get; set; }
    }
}
