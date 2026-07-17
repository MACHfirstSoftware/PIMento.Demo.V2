
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PIMento.Demo.Web.Filters;
using PIMento.Demo.Web.Models;
using System.Net;
using Microsoft.AspNetCore.Http;
using PHXCOM.PlatformSDK.Services;
using PHXCOM.PlatformSDK.Models;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using PIMento.Demo.Web.Utils;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http;
using Microsoft.Extensions.Configuration;

namespace PIMento.Demo.Web.Controllers
{
    public class HomeController : Controller
    {
        private IMemoryCache _cache;
        private readonly IConfiguration _configuration;

        public HomeController(IMemoryCache memoryCache, IConfiguration configuration)
        {
            this._cache = memoryCache;
            _configuration = configuration;
        }

        [HttpGet("/Index")]
        [HttpGet("/")]
        [AnalyticFilter]
        public async Task<IActionResult> Index()
        {
            EbizClient.Session.SetSlugSession(new Dictionary<string, string>());

            List<Feature> features = new List<Feature>();
            List<FilterProp> makes = new List<FilterProp>();

            try
            {
                var featureResponse = await EbizClient.Feature.GetFeaturesAsync();
                features = JsonUtil.ListDeserialize<List<Feature>>(featureResponse.Content) ?? new List<Feature>();
            }
            catch
            {
            }

            try
            {
                var res = await EbizClient.Product.GetItemForLoadDropdownAsync(-1, string.Empty, string.Empty);

                var parsedMakes = JsonUtil.ListDeserialize<List<FilterProp>>(res.Content);
                if (parsedMakes == null || parsedMakes.Count == 0)
                {
                    try
                    {
                        var wrappedPayload = JObject.Parse(res.Content)["value"]?.ToString();
                        if (!string.IsNullOrWhiteSpace(wrappedPayload))
                        {
                            parsedMakes = JsonUtil.ListDeserialize<List<FilterProp>>(wrappedPayload);
                        }
                    }
                    catch
                    {
                    }
                }

                makes = parsedMakes ?? new List<FilterProp>();
            }
            catch
            {
            }

            return View(new Tuple<List<Feature>, List<FilterProp>>(features, makes));
        }

        public async Task<IActionResult> Handler()
        {
            EbizClient.SetMemoryCacheProp(_cache);

            var slugHostOverride = Environment.GetEnvironmentVariable("SLUG_HOST_OVERRIDE")
                ?? _configuration["SlugHostOverride"];
            if (!string.IsNullOrWhiteSpace(slugHostOverride))
            {
                HttpContext.Request.Host = new HostString(slugHostOverride);
                HttpContext.Request.Headers["Host"] = slugHostOverride;
            }

            var res = await EbizClient.GetSlug(HttpContext);
            

            //if ((int)res.StatusCode == StatusCodes.Status404NotFound)
            //{
            //    Add404();
            //}

            if ((int)res.StatusCode == StatusCodes.Status404NotFound || (int)res.StatusCode == StatusCodes.Status409Conflict)
            {
                return RedirectToAction("Error");
            }

            if (res.StatusCode == HttpStatusCode.Moved)
            {
                return RedirectPermanent(((Slug)res.ContentObject).Url);
            }
            ViewBag.breadCrumbs = EbizClient.Session.GetSlugSession();

            if (res.Page.ToLower() == "application")
            {
                EbizClient.Session.SetCurrentAppYearMakeModel(new Application());
                EbizClient.Session.SetFilterCategorySession(new List<ProductCategorySearch>());
                var appContent = JsonUtil.Deserialize<Application>(res.Content);
                ViewBag.appYear = appContent.Year;
                ViewBag.appModel = appContent.Model;
                ViewBag.appMake = appContent.Make;
              Application aaa =   EbizClient.Session.GetCurrentAppYearMakeModel();
                if (appContent != null) 
                {
                    if (EbizClient.Session.GetCurrentAppYearMakeModel().ApplicationId == 0) EbizClient.Session.SetCurrentAppYearMakeModel(appContent);
                }

                var applicationProductResponse = await EbizClient.Application.GetApplicationProductsAsync(appContent.ApplicationId);
                var productcategoryList = new List<ProductCategorySearch>();
                var productList = JsonUtil.ListDeserialize<List<Product>>(applicationProductResponse.Content);
                if (productList != null && productList.Count > 0) 
                {
                    string productString = string.Join(",", productList.Select(x => x.ProductId));
                    productcategoryList = await EbizClient.ProductCategorySearch.getApplicationProductCategoriesAsync(productString);
                    EbizClient.Session.SetFilterCategorySession(productcategoryList);
                }
             
                return View(res.Page, productcategoryList);
            }
            ViewBag.FilterCategoryList = new List<ProductCategorySearch>();
           
            if (res.Page.ToLower() == "category") 
            {
                ViewBag.FilterCategoryList = EbizClient.Session.GetFilterCategorySession();
                ViewBag.CurrentAppContent = EbizClient.Session.GetCurrentAppYearMakeModel();
            }

            if (res.Page.ToLower() == "page")
            {
                PHXCOM.PlatformSDK.Models.Page page = (PHXCOM.PlatformSDK.Models.Page)res.ContentObject;

                if (page.PageName == "ApplicationGuide")
                {

                    Application app = EbizClient.Session.GetCurrentAppYearMakeModel();
                    if (app.Make != null)
                    {
                        var applicationProductResponse = await EbizClient.Application.GetApplicationProductsAsync(app.ApplicationId);
                        var productcategoryList = new List<ProductCategorySearch>();
                        var productList = JsonUtil.ListDeserialize<List<Product>>(applicationProductResponse.Content);
                        if (productList != null && productList.Count > 0)
                        {
                            string productString = string.Join(",", productList.Select(x => x.ProductId));
                            productcategoryList = await EbizClient.ProductCategorySearch.getApplicationProductCategoriesAsync(productString);
                            EbizClient.Session.SetFilterCategorySession(productcategoryList);
                        }

                        ViewBag.appYear = app.Year;
                        ViewBag.appModel = app.Model;
                        ViewBag.appMake = app.Make;

                        return View("Application", productcategoryList);
                    }

                    List<PHXCOM.PlatformSDK.Models.Application> appList = (List<PHXCOM.PlatformSDK.Models.Application>)EbizClient.Application.GetApplications().ContentObject;
                    appList =  appList.OrderBy(a => a.Make).ThenBy(a => a.Model).ThenBy(a => a.Year).ToList();
                    
                    return View("ApplicationGuide", appList);
                }
            }

            return View(res.Page ?? res.ContentType, res.ContentObject);
        }

        [HttpGet("/Catalog")]
        //[HttpGet("/")]
        //[AnalyticFilter]

        public async Task<IActionResult> Catalog()
        {
            //EbizClient.Session.SetSlugSession(new List<string>());
            var res = await EbizClient.Category.GetCatalogsAsync();
            return View(res.ContentObject);
        }

        [HttpGet("/Reset")]
        public JsonResult Reset()
        {
            EbizClient.Session.SetCurrentAppYearMakeModel(null);
            return Json(true);
        }


            [HttpGet("Home/Search")]
        public async Task<IActionResult> Search(string searchText, int applicationId = 0)
        {

            var res = await EbizClient.Search.SearchMainByMetaDescription(searchText, applicationId);
            //var res = EbizClient.SearchMain(searchText);
            return View(res);
        }

        public IActionResult Privacy()
        {
            return View();
        }


        [HttpGet("Error")]
        public IActionResult Error()
        {
            HttpContext.Response.StatusCode = 404;
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }


        private void Add404()
        {
            EbizClient.Content404.AddContent404(new Content404()
            {
                ContentIa404 = "https://" + HttpContext.Request.Host + HttpContext.Request.Path.Value,
                HttpReferer = HttpContext.Request.Path.Value,
                IpAddress = HttpContext.Connection.RemoteIpAddress.ToString(),
            });
        }

        [HttpGet("Home/Cache")]
        public IActionResult Cache()
        {
            return View();
        }

        [HttpPost("Home/FlushCache")]
        public async Task<JsonResult> FlushCache()
        {

                try
                {
                    EbizClient.Cache.FlushAllMemoryCache();
                    string baseUrl = "https://phxapi.azure-api.net/cache/";
                    var cacheApiKey = AppConfig.GetRequired("CacheApi:ApiKey", "CACHE_API_KEY");
                    var cacheSyndicateKey = AppConfig.GetRequired("CacheApi:SyndicateKey", "CACHE_SYNDICATE_KEY");
                    await ExecuteAsyncDelete(baseUrl, cacheApiKey, cacheSyndicateKey);

                    return Json(true);
                }
                catch (Exception)
                {
                    return Json(false);
                }
        }


        public async Task<string> ExecuteAsyncDelete(string baseUrl, string apiKey, string syndicateKey)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    client.BaseAddress = new Uri(baseUrl);
                    client.DefaultRequestHeaders.Accept.Clear();
                    //client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(mediaType));
                    client.DefaultRequestHeaders.Add("APIKey", apiKey);
                    client.DefaultRequestHeaders.Add("SyndicateKey", syndicateKey);


                    // var stringContent = new StringContent("{}", Encoding.UTF8);

                    HttpResponseMessage response = new HttpResponseMessage();
                    response = await client.DeleteAsync(baseUrl);

                    return await response.Content.ReadAsStringAsync();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }


    }
}
