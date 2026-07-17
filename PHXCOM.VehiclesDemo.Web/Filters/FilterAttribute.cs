using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using PHXCOM.PlatformSDK.Services;

namespace PHXCOM.VehiclesDemo.Web.Filters
{

    public class AnalyticFilter : ActionFilterAttribute
    {
        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            EbizClient.WriteAnalytics();
        }
    }


    public class AccessFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!EbizClient.LoginSession.CurrentLogin().LoginSuccess)
            {
                context.Result = new RedirectToRouteResult(new RouteValueDictionary(new { controller = "Account", action = "Login" }));
            }
        }
    }
}
