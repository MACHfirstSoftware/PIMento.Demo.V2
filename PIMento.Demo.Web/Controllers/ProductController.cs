using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PIMento.Demo.Web.Filters;
using PIMento.Demo.Web.Utils;
using PHXCOM.PlatformSDK.Models;
using PHXCOM.PlatformSDK.Services;

namespace PIMento.Demo.Web.Controllers
{
    public class ProductController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("/Product/FilterProductView")]
        public IActionResult FilterProductView()
        {
            return View();
        }

        [HttpGet("/Product/ProductSearchResults")]
        public IActionResult ProductSearchResults()
        {
            return View();
        }

        //[HttpGet("/Product/DiagramItems")]
        //public IActionResult DiagramItems(Product obj, int productId, bool cartTypeCheck = false) 
        //{
        //    return PartialView("DiagramProductItemView", obj);
        //}

        [HttpPost("/Product/CallProductAPI")]
        public async Task<ActionResult> CallProductAPI(int productId, bool isUniversal)
        {
            List<int> allYears = new List<int>();
            if (isUniversal)
            {
                ViewBag.isProductUniversal = 1;

                List<string> objYear = await GetMake(-1, "");

                if (objYear[0].ToString().Contains("year"))
                {
                    allYears = GetDeserializeYear(objYear, true);
                }
                else
                {
                    objYear = await GetMake(-1, "", 0, "", true);
                    ViewBag.noyearsResponse = objYear[0];
                }
            }
            else
            {
                List<string> objMake = await GetMake(-1, "", productId);
                if (objMake[0].ToString().Contains("year"))
                {
                    allYears = GetDeserializeYear(objMake, false);
                }
                else
                {
                    ViewBag.noyearsResponse = objMake[0];
                }
            }
            return Json(allYears);
        }

        public List<int> GetDeserializeYear(List<string> json, bool isUniversal)
        {
            List<int> apps = new List<int>();
            int app = 0;
            dynamic dyanamicObj = JsonConvert.DeserializeObject<dynamic>(json[0]);

            if (!isUniversal)
            {
                if (dyanamicObj != null)
                {
                    foreach (var item in dyanamicObj.years)
                    {
                        string year = item;
                        bool isInt = int.TryParse(year, out app);
                        if (isInt)
                        {
                            apps.Add(app);
                        }
                    }
                }
            }

            else
            {

                if (dyanamicObj != null)
                {
                    foreach (var item in dyanamicObj.value)
                    {
                        if (item.year != null)
                        {
                            apps.Add(Convert.ToInt32(item.year));
                        }
                    }
                }


            }
            return apps;
        }

        [HttpPost("/Product/GetMakesByYear")]
        public async Task<JsonResult> GetMakesByYear(int year, int productId = 0)
        {
            var objModel = await GetMake(year, "", productId);

            return Json(objModel);
        }

        [HttpPost("/Product/GetYearsByMakeAndModel")]
        public async Task<JsonResult> GetYearsByMakeAndModel(int year, string make, int productId = 0)
        {
            var objModel = await GetMake(year, make, productId);
            return Json(objModel);
        }
        public async Task<List<string>> GetMake(int year, string make = "", int productId = 0, string model = "", bool noYears = false)
        {
            List<string> json = new List<string>();
            if (productId > 0)
            {
                return await CallPostAPI(productId, year, make, json, model);
            }
            else
            {
                var res = await EbizClient.Product.GetFilterProductAsync(noYears, year, make);
                if (res.IsSuccessful)
                {
                    JToken jObject = JObject.Parse(res.Content);
                    json.Add(JsonConvert.SerializeObject(jObject));
                }
                return json;
            }
        }

        public async Task<List<string>> CallPostAPI(int productId, int year, string make, List<string> json, string model = "")
        {
            var res = await EbizClient.Configurator.LoadProductYearsAsync(productId, year, make, model);
            if (res.IsSuccessful)
            {
                JToken jObject = JObject.Parse(res.Content);
                json.Add(JsonConvert.SerializeObject(jObject));
            }
            return json;
        }

        [HttpPost("/Product/GetPositionByModel")]
        public async Task<JsonResult> GetPositionByModel(ProductUniversal productUniversal)
        {
            var res = await EbizClient.Configurator.LoadProductDataAsync(productUniversal);
            return Json(res.Content);
        }

        [HttpPost("/Product/GetApplicationFilter")]
        public async Task<JsonResult> GetApplicationFilter(int year, string make, string model)
        {
            try
            {
                var res = await EbizClient.Product.GetItemForLoadDropdownAsync(year, make, model);
                if (!string.IsNullOrWhiteSpace(res.Content))
                {
                    return Json(res.Content);
                }
            }
            catch
            {
            }

            try
            {
                var apps = EbizClient.Application.GetApplications().ContentObject as List<Application>;
                if (apps != null)
                {
                    var normalizedMake = make ?? string.Empty;
                    var normalizedModel = model ?? string.Empty;

                    if (!string.IsNullOrWhiteSpace(normalizedMake))
                    {
                        apps = apps.Where(a => string.Equals(a.Make, normalizedMake, StringComparison.OrdinalIgnoreCase)).ToList();
                    }

                    if (!string.IsNullOrWhiteSpace(normalizedModel))
                    {
                        apps = apps.Where(a => string.Equals(a.Model, normalizedModel, StringComparison.OrdinalIgnoreCase)).ToList();
                    }

                    if (year > 0)
                    {
                        apps = apps.Where(a => a.Year == year).ToList();
                    }

                    object payload;
                    if (string.IsNullOrWhiteSpace(normalizedMake))
                    {
                        payload = apps
                            .Where(a => !string.IsNullOrWhiteSpace(a.Make))
                            .Select(a => new { make = a.Make })
                            .Distinct()
                            .OrderBy(a => a.make)
                            .ToList();
                    }
                    else if (string.IsNullOrWhiteSpace(normalizedModel))
                    {
                        payload = apps
                            .Where(a => !string.IsNullOrWhiteSpace(a.Model))
                            .Select(a => new { model = a.Model })
                            .Distinct()
                            .OrderBy(a => a.model)
                            .ToList();
                    }
                    else
                    {
                        payload = apps
                            .Select(a => new { year = a.Year })
                            .Distinct()
                            .OrderByDescending(a => a.year)
                            .ToList();
                    }

                    var wrapped = JsonConvert.SerializeObject(new { value = payload });
                    return Json(wrapped);
                }
            }
            catch
            {
            }

            return Json(JsonConvert.SerializeObject(new { value = new object[0] }));
        }

        [HttpPost("/Product/GetApplicationByYMM")]
        public async Task<JsonResult> GetApplicationByYMM(int year, string make, string model)
        {
            var res = await EbizClient.Product.GetFilterationResultsAsync(year, make, model);
            var tempList = JsonUtil.ListDeserialize<List<Application>>(res.Content);
            //if (tempList != null && tempList.Count > 0) EbizClient.Session.SetApplicationSession(tempList);

            return Json(res.Content);
        }

        [HttpPost("/Product/SearchResults")]
        public async Task<IActionResult> SearchResults(string keyWord, int applicationId = 0)
        {
            var searchResponse = await EbizClient.Search.SearchProductsByKeyword(keyWord, applicationId);
            ViewBag.Key = keyWord;
            return PartialView("DrawSearchResults", searchResponse);
        }

        [HttpPost("/Product/ClearApplicationSession")]
        public void ClearApplicationSession() 
        {
            EbizClient.Session.SetFilterCategorySession(new List<ProductCategorySearch>());
            EbizClient.Session.SetApplicationSession(new List<Application>());
            EbizClient.Session.SetCurrentAppYearMakeModel(new Application());
        }

        [HttpPost("/Product/GetProductItemMapping")]
        public async Task<JsonResult> GetProductItemMapping(int productId, int itemId) 
        {
            var productItemMappings = await EbizClient.Product.GetProductItemMappingsAsync(productId, itemId);
            return Json(productItemMappings);
        }

        [HttpPost("/Product/GetDiagramHotspotMappings")]
        public async Task<JsonResult> GetDiagramHotspotMappings(int productId)
        {
            var diagramMappings = await EbizClient.DiagramMappings.getDiagramHotspotMappingsAsync(productId);
            return Json(new { details = diagramMappings });
        }

        [HttpGet("/Product/CallProShopConfigurator")]
        public JsonResult CallProShopConfigurator(int productId, string size, string color = null, string style = null, string condition = null, string material = null)
        {
            var filteredItems = EbizClient.Product.GetFilteredProShopItems(productId, size, color, style, condition, material);
            return Json(filteredItems);
        }
    }
}
