using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PIMento.Demo.Web.Filters;
using PIMento.Demo.Web.Models;
using PHXCOM.PlatformSDK.Models;
using PHXCOM.PlatformSDK.Services;

namespace PIMento.Demo.Web.Controllers
{
    public class CategoryController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult SearchResults()
        {
            return View();
        }

        [HttpPost("/Category/GetCategoryQuickMenu")]
        public async Task<JsonResult> GetCategoryQuickMenu() 
        {
            var res = await EbizClient.Category.GetCategoryQuickMenuAsync();
            return Json(res.ContentObject);
        }

        //[HttpPost("/Category/FilterCategoryProducts")]
        //public async Task<JsonResult> FilterCategoryProducts(int categoryId = 0, int page = 1, int applicationId = 0)
        //{
        //    var res = await EbizClient.Category.GetFilteredCategoryProducts(categoryId);
        //    return Json(res.ContentObject);
        //}
    }
}
