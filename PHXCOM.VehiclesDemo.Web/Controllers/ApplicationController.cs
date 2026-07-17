using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PHXCOM.PlatformSDK.Services;

namespace PHXCOM.VehiclesDemo.Web.Controllers
{
    public class ApplicationController : Controller
    {
        [HttpPost("/Application/GetApplicationProducts")]
        public async Task<JsonResult> GetApplicationProducts(int appId)
        {
            var res = await EbizClient.Application.GetApplicationProductsAsync(appId);
            return Json(res.Content);
        }

        [HttpPost("/Application/GetApplicationFitments")]
        public async Task<ActionResult> GetApplicationFitments(int productId, int applicationId)
        {
            var res = await EbizClient.ApplicationFitments.GetApplicationFitmentsAsync(productId, applicationId);

            return PartialView("ApplicationFitments", res.ContentObject);
        }

        [HttpPost("/Application/ApplicationGuide")]
        public IActionResult ApplicationGuide()
        {
            return NoContent();
        }
    }
}
