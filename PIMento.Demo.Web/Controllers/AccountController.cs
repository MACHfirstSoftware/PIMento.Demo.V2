
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PIMento.Demo.Web.Filters;
using PIMento.Demo.Web.Utils;
using PHXCOM.PlatformSDK.Models;
using PHXCOM.PlatformSDK.Services;

namespace PIMento.Demo.Web.Controllers
{
    public class AccountController : Controller
    {

        public AccountController() 
        {
            EbizClient.Session.SetSlugSession(new Dictionary<string, string>());
        }

        [HttpGet("/Account/{target}")] 
        [HttpGet("/Account")]
        [AccessFilter]
        [AnalyticFilter]
        public async Task<IActionResult> Index(string target)
        {
            ViewBag.Target = target;
            var contactAwaiter = EbizClient.Contact.GetContactByEmailAsync(EbizClient.LoginSession.CurrentLogin().LoginUser);
            var countryAwaiter = EbizClient.Common.GetCountriesAsync();

            var contact = (await contactAwaiter).ContentObject as Contact;
            ViewBag.Countries = (await countryAwaiter).ContentObject;

            return View(contact);
        }

        [HttpPost("Account/EditAccountInfo")]
        public async Task<IActionResult> EditAccountInfo(Contact contact)
        {
            contact.ContactEmail = EbizClient.LoginSession.CurrentLogin().LoginUser;
            var res = await EbizClient.Contact.ModifyContactAsync(contact);
            if (res.IsSuccessful) ChangeLoginSessionInfo(contact);

            return Json(res.IsSuccessful);
        }


        private void ChangeLoginSessionInfo(Contact contact)
        {
            var currentLogin = EbizClient.LoginSession.CurrentLogin();
            currentLogin.ContactFirstName = contact.ContactFirstName;
            currentLogin.ContactLastName = contact.ContactLastName;
            currentLogin.ContactAddress = contact.ContactAddress;
            currentLogin.ContactAddress2 = contact.ContactAddress2;
            currentLogin.ContactCity = contact.ContactCity;
            currentLogin.ContactCountry = contact.ContactCountry;
            currentLogin.ContactStateOrTerritory = contact.ContactStateOrTerritory;
            currentLogin.ContactPostal = contact.ContactPostal;

            EbizClient.LoginSession.SetLoginSession(currentLogin);
        }

        [HttpPost("Account/UpdateEmailAndPassword")]
        public JsonResult UpdateEmailAndPassword(string email, bool notify = false, string password = "") 
        {
            int emailSuccess = 0;
            bool passwordSuccess = false;

            //Email Update
            var user = EbizClient.LoginSession.CurrentLogin();
            var userResponse = EbizClient.Account.ChangeAuthUserName(email, new Guid(user.LoginUserId));

            if (userResponse.IsSuccessful)
            {
                //Update success
                user.LoginUser = email;

                var res = EbizClient.Contact.GetContactByEmail(user.LoginUser);
                
                EbizClient.Contact.PatchContactAsync(new Contact() { ContactId = (res.ContentObject as Contact).ContactId, ContactOptIn = notify });

                EbizClient.LoginSession.SetLoginSession(user);
                emailSuccess = 1;
            }
            else 
            {
                //Email already exist
                if (userResponse.StatusCode == System.Net.HttpStatusCode.NotAcceptable) 
                {
                    emailSuccess = 2;
                    return Json(new { isEmailSuccessfull = emailSuccess, isPasswordSuccessfull = passwordSuccess });
                }
                else 
                {
                    emailSuccess = 3; //Other errors
                    return Json(new { isEmailSuccessfull = emailSuccess, isPasswordSuccessfull = passwordSuccess });
                }
                
            }

            //Password Update
            if (!string.IsNullOrEmpty(password)) 
            {
                var passwordResponse = EbizClient.Account.GetPasswordChangeToken(EbizClient.LoginSession.CurrentLogin().LoginUser);
                if (passwordResponse.IsSuccessful)
                {
                    passwordSuccess = PasswordChange(EbizClient.LoginSession.CurrentLogin().LoginUser, password, (passwordResponse.ContentObject as AuthToken).UserToken);
                }
            }
            

            return Json(new {isEmailSuccessfull= emailSuccess, isPasswordSuccessfull= passwordSuccess });
        }


        //[HttpPost("Account/UpdateEmail")]
        //public int UpdateEmail(string email)
        //{
        //    var user = EbizClient.LoginSession.CurrentLogin();
        //    var res = EbizClient.Account.ChangeAuthUserName(email, new Guid(user.LoginUserId));
        //    // change login session info
        //    if (res.IsSuccessful)
        //    {
        //        user.LoginUser = email;
        //        EbizClient.LoginSession.SetLoginSession(user);
        //        return 1;
        //    }
        //    if (res.StatusCode == System.Net.HttpStatusCode.NotAcceptable) return 2;
        //    return 3;
        //}


        //[HttpPost("Account/ChangePassword")]
        //public bool ChangePassword(string password)
        //{
        //    var res = EbizClient.Account.GetPasswordChangeToken(EbizClient.LoginSession.CurrentLogin().LoginUser);
        //    if (res.IsSuccessful)
        //    {
        //        return PasswordChange(EbizClient.LoginSession.CurrentLogin().LoginUser, password, (res.ContentObject as AuthToken).UserToken);
        //    }
        //    return false;
        //}

        private bool PasswordChange(string email, string password, string token)
        {
            var res = EbizClient.Account.ChangePassword(new PasswordChange
            {
                CnfirmPassword = password,
                NewPassword = password,
                UserLogin = email,
                UserToken = token
            });
            return res.IsSuccessful;
        }


        [HttpPost("Account/DoLogin")]
        public bool DoLogin(string userName, string password)
        {
            bool success = false;
            var res = EbizClient.Account.Login(userName, password);

            if (res.IsSuccessful)
            {
                var login = res.ContentObject as User;
                success = login.LoginSuccess;
                if (login.LoginSuccess)
                {
                    EbizClient.LoginSession.SetLoginSession(login);
                }
            }

            return success;

        }

        [HttpGet("Account/Login")]
        [AnalyticFilter]

        //public IActionResult Login(string userName, string password)
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost("Account/Logout")]
        public IActionResult Logout(bool savecurrentOrder = false)
        {
            try
            {
                EbizClient.LoginSession.ClearLoginSession();

                if (!savecurrentOrder)
                {
                    EbizClient.Order.ResetCurrentBucket();
                }
                else
                {
                    var currentOrder = EbizClient.Order.GetCurrentOrder();
                    currentOrder.ContactId = 0;
                    currentOrder.ShippingInfo = new UserInfo();
                    currentOrder.BillingInfo = new UserInfo();
                    EbizClient.Order.SetOrderSession(currentOrder);
                }


                return Json(true);
            }
            catch (Exception)
            {
                return Json(false);
            }


        }


        [HttpGet("Account/ForgetPassword")]
        [AnalyticFilter]

        //public IActionResult Login(ring userName, string password)
        public IActionResult ForgetPassword()
        {
            return View();
        }

        [HttpPost("Account/SendResetPasswordLink")]
        //public IActionResult Login(string userName, string password)
        public async Task<bool> SendResetPasswordLink(string email)
        {

            var token = EbizClient.Account.GetPasswordChangeToken(email);
            if (token.IsSuccessful)
            {
                string resetLink = "https://" + HttpContext.Request.Headers["Host"].ToString() + "/Account/ResetPassword/" + (token.ContentObject as AuthToken).UserToken;

                StringBuilder stringBuilder = new StringBuilder();
                stringBuilder.Append("<div> Hello,");
                stringBuilder.Append(" <br/><br/> We have received your request for a password reset, which you can do <a href='" + resetLink + "'>here</a>. This link will expire in 24 hours.");
                stringBuilder.Append("<br/><br/>Thank you,<br/><br/> The Vehicle Demo");
                stringBuilder.Append("</div>");
                return await EmailUtil.SendEmail("support@Demo.com", email, "Password Reset Request", stringBuilder.ToString(), "Vehicle Demo Support");
            }
            else
            {
                return false;
            }



        }

        [HttpGet("Account/ResetPassword/{token}")]
        [AnalyticFilter]

        public async Task<IActionResult> ResetPassword(string token)
        {
            int status = 1; // live

            var res = await EbizClient.Account.GetTokenStatus(token);
            if (res.IsSuccessful)
            {
                var authToken = res.ContentObject as AuthToken;
                if (authToken.UserTokenExpireOn < DateTime.UtcNow) status = 2; //expire
            }
            else status = 2; //invalid
            ViewBag.Status = status;
            return View();

        }

        [HttpPost("Account/ResetPassword")]
        public async Task<bool> ResetPassword(string token, string password)
        {

            var res = await EbizClient.Account.GetTokenStatus(token);
            if (res.IsSuccessful)
            {
                var authToken = res.ContentObject as AuthToken;
                return PasswordChange(authToken.UserLogin, password, token);

            }
            return false;

        }

        [HttpGet("Account/PrivacyPolicy")]
        [AnalyticFilter]

        //public IActionResult Login(string userName, string password)
        public IActionResult PrivacyPolicy()
        {
            return View();
        }
        [HttpGet("Account/SiteMap")]
        [AnalyticFilter]
        //public IActionResult Login(string userName, string password)
        public IActionResult SiteMap()
        {
            return View();
        }


        [HttpGet("/Account/Forbidden")]
        public IActionResult Forbidden()
        {
            return Json("Forbidden");
        }

        [HttpGet("/Account/Create")]
        [AnalyticFilter]
        public IActionResult Create()
        {
            return View();
        }

        [HttpGet("/Account/GetAllApplicationByYMM")]
        public async Task<IActionResult> GetAllApplicationByYMM(int year, string make, string model)
        {
            var res = await EbizClient.Product.GetFilterationResultsAsync(year, make, model);
            var tempList = JsonUtil.ListDeserialize<List<Application>>(res.Content);
            ViewBag.appData = res.Content;
            return PartialView("VehiclesView", tempList);
        }

        [HttpGet("/Account/GetSavedApplications")]
        public async Task<IActionResult> GetSavedApplications(int contactId = 0)
        {
            var res = await EbizClient.AppSerialMappings.GetSavedApplicationsAsync(contactId);
            var countryAwaiter = EbizClient.Common.GetCountriesAsync();
            ViewBag.Countries = (await countryAwaiter).ContentObject;
            return PartialView("SavedApplication", res.ContentObject);
        }

        [HttpPost("/Account/SaveVehicles")]
        public async Task<JsonResult> SaveVehicles(ApplicationSerialMappings vehicleInfo) 
        {
            var savedVehiclesRes = await EbizClient.AppSerialMappings.GetSavedApplicationsAsync(vehicleInfo.contactId);
            var existingVehicle = JsonUtil.ListDeserialize<List<ApplicationSerials>>(savedVehiclesRes.Content);
            if (existingVehicle.Where(x => x.applicationId == vehicleInfo.applicationId && x.contactId == vehicleInfo.contactId).Any()) 
            {
                return Json(3);
            }
            var res = await EbizClient.AppSerialMappings.SaveApplicationAsync(vehicleInfo);
            if (res.StatusCode == System.Net.HttpStatusCode.Created)
            {
                return Json(1);
            }
            else 
            {
                return Json(2);
            }
            
        }

        [HttpPost("/Account/UpdateVehicle")]
        public async Task<JsonResult> UpdateVehicle(ApplicationSerialMappings serials)
        {
            var res = await EbizClient.AppSerialMappings.PatchVehicleAsync(serials);
            if (res.IsSuccessful) return Json(1);
            else return Json(2);
        }

        [HttpPost("/Account/DeleteVehicles")]
        public async Task<JsonResult> RemoveVehicle(int appSerialMappingId) 
        {
            var res = await EbizClient.AppSerialMappings.RemoveVehiclesAsync(appSerialMappingId);
            if (res.IsSuccessful) return Json(1);
            else return Json(2);
        }

        [HttpPost("/Account/Create")]
        [AnalyticFilter]
        public async Task<IActionResult> Create(UserInfo userInfo)
        {

            var contact = SetContact(userInfo);

            var resContact = await EbizClient.Contact.AddNewContactAsync(contact);
            if (resContact.StatusCode == System.Net.HttpStatusCode.NotAcceptable)
            {
                return Json(2);
            }

            if (resContact.IsSuccessful)
            {
                contact = resContact.ContentObject as Contact;
            }

            var auth = await AddNewUser(new Contact { ContactId = contact.ContactId }, userInfo.Password, userInfo.Email);
            if (!auth) return Json(3);

            DoLogin(userInfo.Email, userInfo.Password);
            return Json(1);
        }

        [HttpPost("/Account/GetCountries")]
        public async Task<JsonResult> GetCountries() 
        {
            var res = await EbizClient.Common.GetCountriesAsync();
            return Json(res.ContentObject);
        }

        private async Task<bool> AddNewUser(Contact contact, string password, string email)
        {


            var res = EbizClient.Account.AddNewUser(new Auth { UserLogin = email, UserPassword = password });
            if (res.IsSuccessful)
            {
                contact.ContactLoginKey = (res.ContentObject as AuthUser).UserId;
                var contactPatch = await EbizClient.Contact.PatchContactAsync(contact);
                return contactPatch.IsSuccessful;
            }
            return res.IsSuccessful;
        }

        private Contact SetContact(UserInfo userInfo)
        {
            return new Contact
            {
                ContactAddress = userInfo.Address1,
                ContactFirstName = userInfo.FirstName,
                ContactLastName = userInfo.LastName,
                ContactCity = userInfo.City,
                ContactCountry = userInfo.CountryCode,
                ContactEmail = userInfo.Email,
                ContactPostal = userInfo.PostalCode,
                ContactAddress2 = userInfo.Address2,
                ContactCompany = "",
                ContactPhone = userInfo.Phone,
                ContactOptIn = true,
                ContactPhoneType = "Mobile",
                ContactStateOrTerritory = userInfo.StateAbbr,
                ContactTitle = "MR",
            };

        }

    }
}