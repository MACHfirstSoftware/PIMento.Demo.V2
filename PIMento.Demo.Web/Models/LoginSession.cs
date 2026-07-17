using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using PHXCOM.PlatformSDK.Models;

namespace PIMento.Demo.Web.Models
{


    //public class LoginSession
    //{
    //    #region Singleton
    //    private const string SESSION_SINGLETON_NAME = "LOGIN_502E69E5-668B-E011-951F-00155DF26207";

    //    static IHttpContextAccessor _httpContextAccessor = new HttpContextAccessor();
    //    private LoginSession()
    //    {

    //    }

    //    public static void SetLoginSession(User user)
    //    {
    //        _httpContextAccessor.HttpContext.Session.SetString(SESSION_SINGLETON_NAME, JsonConvert.SerializeObject(user));

    //    }

    //    public static User Current
    //    {
    //        get
    //        {
    //            if (_httpContextAccessor.HttpContext.Session.GetString(SESSION_SINGLETON_NAME) == null)
    //            {
    //                _httpContextAccessor.HttpContext.Session.SetString(SESSION_SINGLETON_NAME, JsonConvert.SerializeObject(new User()));
    //            }

    //            return JsonConvert.DeserializeObject<User>(_httpContextAccessor.HttpContext.Session.GetString(SESSION_SINGLETON_NAME));
    //        }
    //    }

    //    #endregion


    //    //public timezone TimeZone { get; set; }
    //    public static void ClearSession()
    //    {
    //        _httpContextAccessor.HttpContext.Session.SetString(SESSION_SINGLETON_NAME, JsonConvert.SerializeObject(new User()));
    //    }


    //}
}
