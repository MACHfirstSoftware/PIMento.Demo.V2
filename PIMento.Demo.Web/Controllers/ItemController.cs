using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PHXCOM.PlatformSDK.Services;

namespace PIMento.Demo.Web.Controllers
{
    public class ItemController : Controller
    {
        [HttpPost("/Item/GetItemFitments")]
        public async Task<ActionResult> GetItemFitments(int skuId)
        {
            var res = await EbizClient.Item.GetItemFitmentsAsync(skuId);
            return PartialView("ItemFitments", res.ContentObject);
        }
    }
}
