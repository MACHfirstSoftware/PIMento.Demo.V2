using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PIMento.Demo.Web.Filters;
using PIMento.Demo.Web.Service;
using PIMento.Demo.Web.Utils;
using PHXCOM.PlatformSDK.Models;
using PHXCOM.PlatformSDK.Services;

namespace PIMento.Demo.Web.Controllers
{
    public class OrderController : Controller
    {
        private readonly ILogger<OrderController> _logger;

        public OrderController(ILogger<OrderController> logger)
        {
            _logger = logger;
            EbizClient.Session.SetSlugSession(new Dictionary<string, string>());
        }

        [HttpPost("Order/AddItemsToBucket")]
        public IActionResult AddItemsToBucket(List<OrderItem> items, List<Modifier> selectedCurrentModifiers)
        {
            if (items == null || items.Count == 0)
            {
                var requestId = HttpContext?.TraceIdentifier;
                _logger.LogWarning(
                    "Cart mutation rejected. Action={Action} Reason={Reason} RequestId={RequestId}",
                    "AddItemsToBucket",
                    "No order items provided",
                    requestId);

                return BadRequest(new
                {
                    code = "invalid_request",
                    message = "At least one order item is required.",
                    requestId
                });
            }

            selectedCurrentModifiers ??= new List<Modifier>();

            var res = EbizClient.Order.AddItemsToBucket(items, selectedCurrentModifiers);
            if (res == null)
            {
                var requestId = HttpContext?.TraceIdentifier;
                _logger.LogError(
                    "Cart mutation failed. Action={Action} Reason={Reason} ItemCount={ItemCount} RequestId={RequestId}",
                    "AddItemsToBucket",
                    "Order service returned null response",
                    items.Count,
                    requestId);

                return StatusCode(StatusCodes.Status502BadGateway, new
                {
                    code = "upstream_error",
                    message = "Unable to add items to cart.",
                    requestId
                });
            }

            res.CurrentOrderStep = 1;

            EbizClient.Order.SetOrderSession(res);
            _logger.LogInformation(
                "Cart mutation succeeded. Action={Action} OrderId={OrderId} ItemCount={ItemCount} ModifierCount={ModifierCount} RequestId={RequestId}",
                "AddItemsToBucket",
                res.Id,
                items.Count,
                selectedCurrentModifiers.Count,
                HttpContext?.TraceIdentifier);

            return Json(res);
        }

        [HttpPost("Order/ChangeItemQty")]
        public bool ChangeItemQty(OrderItem orderItem)
        {
            var currentOrderId = EbizClient.Order.GetCurrentOrder()?.Id;
            _logger.LogInformation(
                "Cart mutation requested. Action={Action} OrderId={OrderId} Payload={Payload} RequestId={RequestId}",
                "ChangeItemQty",
                currentOrderId,
                JsonConvert.SerializeObject(orderItem),
                HttpContext?.TraceIdentifier);

            EbizClient.Order.ChangeItemQuantity(orderItem);
            return true;
        }

        [HttpPost("Order/RemoveItemFromBucket")]
        public IActionResult RemoveItemFromBucket(int itemId)
        {
            var res = EbizClient.Order.RemoveItemFromBucket(itemId);
            var orderItemsCount = res?.OrderItems?.Count ?? 0;

            _logger.LogInformation(
                "Cart mutation processed. Action={Action} OrderId={OrderId} ItemId={ItemId} RemainingItemCount={RemainingItemCount} RequestId={RequestId}",
                "RemoveItemFromBucket",
                res?.Id,
                itemId,
                orderItemsCount,
                HttpContext?.TraceIdentifier);

            return Json(orderItemsCount);
        }

        [HttpGet("Order/CurrentOrderInfo")]
        public IActionResult CurrentOrderInfo(bool fromCart = false)
        {
            var res = EbizClient.Order.GetCurrentOrder();
            res.AllowCartItemChanges = fromCart;
            return View(res);

        }

        [HttpGet("Order/CurrentOrderItemView")]
        public IActionResult CurrentOrderItemView()
        {

            var res = EbizClient.Order.GetCurrentOrder();
            return View(res);
        }

        [HttpGet("Order/Cart")]
        //[AnalyticFilter]
        public IActionResult Cart()
        {
            var res = EbizClient.Order.GetCurrentOrder();
            //write analytics
            EbizClient.Order.LogOrderAnalyticsAsync(new MarketingAnalyticDetail(), res.Id.ToString()).GetAwaiter().GetResult();

            res.CurrentOrderStep = 1;

            EbizClient.Order.SetOrderSession(res);
            ViewBag.OnlyTotal = true;
            return View(res);
        }

        [HttpGet("Order/ViewCart")]
        //[AnalyticFilter]
        public IActionResult ViewCart()
        {
            var res = EbizClient.Order.GetCurrentOrder();
            //write analytics
            if (!res.IsInCartPage)
            {
                //write analytics
                EbizClient.Order.LogOrderAnalyticsAsync(new MarketingAnalyticDetail(), res.Id.ToString()).GetAwaiter().GetResult();

                //Write process trial and update process current step
                EbizClient.ProcessTrail.AddProcessTrailAsync(new ProcessTrail() { workflowPhaseId = 1155, notes = "Cart" }, res.Id).GetAwaiter().GetResult();
                res.IsInCartPage = true;
            }

            ViewBag.OnlyTotal = true;
            EbizClient.Order.SetOrderSession(res);
            return PartialView("SlidingCartList", res);
        }

        [HttpGet("Order/OrderConfirmation/{id}")]
        [HttpGet("Order/OrderConfirmation")]
        //[AnalyticFilter]

        public async Task<IActionResult> OrderConfirmation(int id = 0)
        {
            //Microsoft.Extensions.Primitives.StringValues paymentFailed = "0";
            //var fromFailPayment = HttpContext.Request.Headers.TryGetValue("payment-failed", out paymentFailed);
            var currentOrder = EbizClient.Order.GetCurrentOrder();



            if (currentOrder.Id > 0)
            {
                var countryAwaiter = EbizClient.Common.GetCountriesAsync();
                var shippingAwaiter = EbizClient.Order.GetShippingMethodsAsync(currentOrder.Id);
                var CardTypeAwaiter = EbizClient.Order.GetCreditCardsAsync();

                var formURI = Payment.ProcessStepOne(EbizClient.Order.GetCurrentOrder(), HttpContext.Request.Headers["Host"].ToString());

                ViewBag.Countries = (await countryAwaiter).ContentObject;
                ViewBag.ShippingMethods = (await shippingAwaiter).ContentObject;
                ViewBag.CardTypes = (await CardTypeAwaiter).ContentObject;
                ViewBag.PaymentFormAction = formURI;
                ViewBag.PaymentStatus = id;
                ViewBag.Months = CommonUtil.GetMonths();

                currentOrder.Total = (currentOrder.SubTotal + currentOrder.ShippingCost + currentOrder.Tax) - currentOrder.CouponDiscount;
                EbizClient.Order.SetOrderSession(currentOrder);
            }
            ViewBag.ShortCart = true;
            ViewBag.NoLayoutView = true;

            currentOrder = EbizClient.Order.GetCurrentOrder();

            //write analytics
            if (!currentOrder.IsInShippingPage)
            {
                //write analytics
                EbizClient.Order.LogOrderAnalyticsAsync(new MarketingAnalyticDetail(), currentOrder.Id.ToString()).GetAwaiter().GetResult();

                //Write process trial and update process current step
                EbizClient.ProcessTrail.AddProcessTrailAsync(new ProcessTrail() { workflowPhaseId = 1157, notes = "Shipping and Payment" }, currentOrder.Id).GetAwaiter().GetResult();
                currentOrder.IsInShippingPage = true;
            }

            currentOrder.CurrentOrderStep = 3;
            EbizClient.Order.SetOrderSession(currentOrder);
            if (EbizClient.LoginSession.CurrentLogin().LoginSuccess) currentOrder.HasLogin = true;

            return View(currentOrder);
        }

        private UserInfo SetUserInfo()
        {

            var user = EbizClient.LoginSession.CurrentLogin();
            return new UserInfo
            {
                FirstName = user.ContactFirstName,
                LastName = user.ContactLastName,
                Address1 = user.ContactAddress,
                Address2 = user.ContactAddress2,
                City = user.ContactCity,
                CountryCode = user.ContactCountry,
                StateAbbr = user.ContactStateOrTerritory,
                PostalCode = user.ContactPostal,
                Phone = user.ContactPhone,
                Email = user.LoginUser
            };
        }

        [HttpGet("Order/GetStates")]
        public async Task<IActionResult> GetStates(string countryCode)
        {
            var res = await EbizClient.Common.GetStatesByCountryCodeAsync(countryCode);
            return Json(res.ContentObject);

        }

        [HttpGet("Order/GetCartItemCount")]
        public int GetCartItemCount()
        {
            var res = EbizClient.Order.GetCurrentOrder();
            return res.OrderItems.Count;

        }

        [HttpPost("Order/SetShippingInfo")]
        public async Task<bool> SetShippingInfo(UserInfo userInfo, bool contactNotify)
        {
            try
            {

                var contactExistAwaiter = EbizClient.Contact.GetContactByEmailAsync(userInfo.Email);
                var res = EbizClient.Order.SetShippingDetails(userInfo);

                // check contact already exist in the DB
                var contactExist = await contactExistAwaiter;
                var currentOrder = EbizClient.Order.GetCurrentOrder();

                //set shipping tax for colorado temporary
                if (userInfo.StateAbbr.ToUpper() == "CO")
                {
                    var tempTax = Math.Round((currentOrder.SubTotal * (decimal)0.029), 2);
                    currentOrder.Tax = tempTax;
                }
                else
                {
                    currentOrder.Tax = 0;
                }

                var shippingAwaiter = EbizClient.Order.GetShippingMethodsAsync(currentOrder.Id);
                var shippingRules = (await shippingAwaiter).ContentObject as List<PHXCOM.PlatformSDK.Models.ShippingRule>;
                if (shippingRules.Count > 0)
                {
                    if (shippingRules.Count == 1)
                    {
                        var shipRule = shippingRules.First();
                        currentOrder.ShippingCost = shipRule.Cost;
                        currentOrder.ShippingMethod = shipRule.ShippingRuleId;
                        currentOrder.ShippingMethodName = shipRule.ShippingRuleName;
                    }
                    else
                    {
                        foreach (var item in shippingRules)
                        {
                            if (item.ShippingRuleId == currentOrder.ShippingMethod)
                            {
                                currentOrder.ShippingCost = item.Cost;
                                currentOrder.ShippingMethodName = item.ShippingRuleName;
                                currentOrder.ShippingMethod = item.ShippingRuleId;
                            }
                        }
                    }

                }

                currentOrder.Total = (currentOrder.SubTotal + currentOrder.ShippingCost + currentOrder.Tax) - currentOrder.CouponDiscount;

                if (!EbizClient.LoginSession.CurrentLogin().LoginSuccess)
                {
                    if (contactExist.StatusCode == HttpStatusCode.NoContent)
                    {
                        var contact = await AddNewContact();
                        currentOrder.ContactId = contact.ContactId ?? 0;
                        currentOrder.HasLogin = false;
                    }
                    else
                    {
                        var contact = contactExist.ContentObject as Contact;
                        currentOrder.ContactId = (contactExist.ContentObject as Contact).ContactId ?? 0;
                        currentOrder.HasLogin = contact.ContactLoginKey == null ? false : true;
                    }
                    EbizClient.Contact.SetContactToAnalytic(currentOrder.ContactId);

                    // modify order with current contact
                    await EbizClient.Order.ModifyCartAsync(new Order() { CartId = res.Id, ContactId = currentOrder.ContactId });

                }
                // Set order total
                await EbizClient.Order.ModifyCartAsync(new Order() { CartId = res.Id, Total = currentOrder.Total });

                currentOrder.ContactNotify = contactNotify;
                await EbizClient.Contact.PatchContactAsync(new Contact() { ContactId = currentOrder.ContactId, ContactOptIn = contactNotify });
                EbizClient.Order.SetOrderSession(currentOrder);

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        [HttpGet("Order/Finish")]
        
        public IActionResult Finish()
        {
            //CurrentOrder res = JsonConvert.DeserializeObject<CurrentOrder>(HttpContext.Session.GetString("completeOrder"));
            CurrentOrder res = EbizClient.Order.GetCompleteOrderSession();

            // Uncomment if reorder want to apply.
            //CurrentOrder pRes = await GetPastOrder(res.Id);

            //EbizClient.Order.SetOrderSession(pRes);

            //pRes.CompanyLogo = res.CompanyLogo;
            //pRes.CompanyName = res.CompanyName;

            //write analytics
            EbizClient.Order.LogOrderAnalyticsAsync(new MarketingAnalyticDetail(), res.Id.ToString()).GetAwaiter().GetResult();

            ViewBag.FromPastOrder = false;
            ViewBag.NoLayoutView = true;
            return View(res);
        }


        [HttpPost("Order/SetShippingMethod")]
        public bool SetShippingMethod(int shippingMethod, string shippingMethodName, decimal cost)
        {
            var res = EbizClient.Order.GetCurrentOrder();
            res.ShippingMethodName = shippingMethodName;
            res.ShippingMethod = shippingMethod;
            res.ShippingCost = cost;
            res.Total = (res.SubTotal + res.Tax + cost) - res.CouponDiscount;
            EbizClient.Order.SetOrderSession(res);
            return true;
        }


        [HttpPost("Order/SubmitOrder")]
        [AnalyticFilter]
        public async Task<JsonResult> SubmitOrder(bool sameAsShipping, UserInfo userInfo, int ccType, string password = "", bool createLogin = false)
        {
            var res = EbizClient.Order.GetCurrentOrder();
            res.AddNewLogin = createLogin;
            res.ShippingInfo.Password = password;
            //res.CcType = ccType;

            EbizClient.Order.SetOrderSession(res);

            if (sameAsShipping) userInfo = res.ShippingInfo;

            EbizClient.Order.SetBillingDetails(userInfo);
            var formURI = Payment.ProcessStepOne(EbizClient.Order.GetCurrentOrder(), HttpContext.Request.Headers["Host"].ToString());
            await EbizClient.Common.PurchaseAsync(new Purchase { first_name = res.ShippingInfo.FirstName, last_name = res.ShippingInfo.LastName, amount = res.SubTotal, email_address = res.ShippingInfo.Email });
            return Json(new { isSuccess = true, uri = formURI });
        }


        //this web hook url is fired by NMI when payment recieved
        [HttpGet("Order/Verify")]
        public async Task<IActionResult> Verify()
        {
            //var token = HttpContext.Request.Query["token-id"].ToString();
            //var res = Payment.ProcessStepTwo(token);

            Tuple<int, string> res = new Tuple<int, string>(1, "");

            // payment was successed. complete ongoing order
            if (res.Item1 == 1)
            {
                var orderFinalized = await FinalizeOrder(res.Item2);
                if(!orderFinalized) return RedirectToAction("OrderConfirmation", new { id = 2 });
                await SendOrderCompleteEmail(EbizClient.Order.GetCurrentOrder());

                EbizClient.Order.ResetCurrentBucket();
                return RedirectToAction("Finish");
            }

            // payment was falied. back to confirmation page
            return RedirectToAction("OrderConfirmation", new { id = 1 });
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

        private async Task<bool> FinalizeOrder(string paymentToken)
        {
            var currentOrder = EbizClient.Order.GetCurrentOrder();

            // create contact
            if (currentOrder.ContactId == 0)
            {
                var contact = await AddNewContact();
                currentOrder.ContactId = contact.ContactId ?? 0;

            }
            // create login for new users
            if (currentOrder.AddNewLogin)
            {
                var auth = await AddNewUser(new Contact { ContactId = currentOrder.ContactId }, currentOrder.ShippingInfo.Password, currentOrder.ShippingInfo.Email);
            }


            // force loging 
            if (!EbizClient.LoginSession.CurrentLogin().LoginSuccess && ((currentOrder.HasLogin && currentOrder.verifiedContact) || currentOrder.AddNewLogin))
            {
                ForceLogin(currentOrder.ContactId);
            }


            return await CompleteOrder(paymentToken, currentOrder);
        }

        
        private async Task<bool> CompleteOrder(string paymentToken, CurrentOrder currentOrder)
        {

            var order = new Order
            {
                CartId = currentOrder.Id,
                PaymentMethodId = currentOrder.PaymentMethodId ?? 1,
                TransactionNumber = paymentToken,
                //AccountId = 1039,
                ShippingRuleId = currentOrder.ShippingMethod,
                AmountPaid = currentOrder.Total,
                ContactId = currentOrder.ContactId,
                Shipping = currentOrder.ShippingCost,
                Tax = currentOrder.Tax,
                Discount = currentOrder.CouponDiscount,
                CcType = currentOrder.CcType > 0 ? currentOrder.CcType : null

            };
            var res = await EbizClient.Order.CompleteOrderAsync(order);
            currentOrder.PaymentToken = paymentToken;
            EbizClient.Order.SetCompleteOrderSession(currentOrder);
            EbizClient.ProcessTrail.AddProcessTrailAsync(new ProcessTrail() { workflowPhaseId = 1108, notes = "Order Complete" }, currentOrder.Id).GetAwaiter().GetResult();
            //HttpContext.Session.SetString("completeOrder", JsonConvert.SerializeObject(currentOrder));
            return res.IsSuccessful;
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

        private async Task<Contact> AddNewContact()
        {

            var currentOrder = EbizClient.Order.GetCurrentOrder();
            var contact = SetContact(currentOrder.ShippingInfo);

            var resContact = await EbizClient.Contact.AddNewContactAsync(contact);
            if (resContact.IsSuccessful)
            {
                var contactNew = resContact.ContentObject as Contact;
                contact.ContactId = contactNew.ContactId;
                return contact;
            }
            return new Contact();
        }


        [HttpGet("/Order/PastOrders")]
        public async Task<IActionResult> PastOrders()
        {
            var orders = await EbizClient.Order.GetOrdersByContactAsync(EbizClient.LoginSession.CurrentLogin().ContactId ?? 0);
            return View(orders.ContentObject);
        }

        [HttpGet("/Order/OrderHistory/{id}")]
        [AnalyticFilter]
        public async Task<IActionResult> OrderHistory(int id)
        {
            ViewBag.FromPastOrder = true;
            ViewBag.OrderFinish = true;
            var pastOrder = await GetPastOrder(id);
            return View("Finish", pastOrder);

        }



        private async Task<CurrentOrder> GetPastOrder(int orderId)
        {
            try
            {
                var orderAwaiter = EbizClient.Order.GetOrderAsync(orderId);
                var items = (await EbizClient.Order.GetOrderItemsAsync(orderId)).ContentObject as List<OrderItem>;
                var orderProductsAwaiter = EbizClient.Product.GetProductByIdListAsync(items.Select(x => x.ProductId ?? 0).ToList());
                var order = await orderAwaiter;

                Product product = null;
                CurrentOrder pastOrder = null;

                if (order.IsSuccessful)
                {
                    var orderProducts = (await orderProductsAwaiter).ContentObject as List<Product>;
                    pastOrder = new CurrentOrder();
                    pastOrder = SetObject(order.ContentObject as Order);

                    foreach (var item in items)
                    {
                        item.Product = new Product();
                        product = orderProducts.FirstOrDefault(x => x.ProductId == item.ProductId);
                        if (product != null)
                        {
                            item.Product = product;
                            item.ProductImage = product.ImageThumb;
                        }
                        item.LineUnitPrice = item.LineUnitPaid;
                    }
                    pastOrder.OrderItems = items;
                }

                return pastOrder;
            }
            catch (Exception)
            {
                return new CurrentOrder();
            }


        }

        [HttpGet("/Order/TryContactVerify")]
        public async Task<Tuple<bool, int, bool>> TryContactVerify(string email)
        {
            var res = await EbizClient.Contact.GetContactByEmailAsync(email.Trim());
            if (res.ContentObject != null)
            {
                bool isPhone = false;
                Contact contact = (Contact)res.ContentObject;
                var randomNumber = CommonUtil.RandomNumber(100000, 999999);

                HttpContext.Session.SetString("verifyKey", randomNumber.ToString());
                if (contact.ContactPhone != null && contact.ContactPhone != "")
                {
                    sendVerificationSMS(contact.ContactPhone, randomNumber.ToString()); isPhone = true;
                }
                else
                {
                    await sendVerificationEmail(email, randomNumber.ToString());
                }

                return new Tuple<bool, int, bool>(true, randomNumber, isPhone);
            }
            else
            {
                return new Tuple<bool, int, bool>(false, 0, false);
            }
        }

        [HttpPost("/Order/VerifyCode")]
        public async Task<JsonResult> VerifyCode(string input, string email)
        {
            var res = EbizClient.Order.GetCurrentOrder();
            var code = HttpContext.Session.GetString("verifyKey");
            Contact contact = new Contact();
            bool successLogin = false;

            if (input == code)
            {
                var contactRes = EbizClient.Contact.GetContactByEmailAsync(email);
                res.verifiedContact = true;

                contact = (Contact)((await contactRes).ContentObject);

                if (contact.ContactLoginKey != null && contact.ContactLoginKey != Guid.Empty)
                {
                    successLogin = ForceLogin(contact.ContactId ?? 0);
                }
                if (successLogin) res.ContactId = contact.ContactId.GetValueOrDefault();
            }
            else
            {
                res.verifiedContact = false;
            }

            EbizClient.Order.SetOrderSession(res);
            return Json(new { isCorrectInput = res.verifiedContact, userInfo = contact, successLogin = successLogin });
        }

        public CurrentOrder SetObject(Order order)
        {
            CurrentOrder pastOrder = new CurrentOrder();
            pastOrder.Id = order.OrderId ?? 0;
            pastOrder.Total = order.Total ?? 0;
            pastOrder.SubTotal = order.SubTotal ?? 0;
            pastOrder.CouponDiscount = order.Discount ?? 0;



            pastOrder.ShippingCost = order.Shipping ?? 0;
            pastOrder.Tax = order.Tax ?? 0;
            pastOrder.ShippingMethodName = order.ShippingMethod;
            pastOrder.ShippingMethod = 1;// no need for finish page. just need > 0

            pastOrder.BillingInfo = new UserInfo()
            {
                Address1 = order.BillingStreetAddress,
                Address2 = order.BillingStreetAddress2,
                City = order.BillingCity,
                CountryName = order.BillingCountry,

                FirstName = order.BillingFirstName,
                LastName = order.BillingLastName,
                Phone = order.BillingPhone,
                PostalCode = order.BillingPostal,
                StateName = order.BillingStateOrTerritory,
            };

            pastOrder.ShippingInfo = new UserInfo()
            {

                Address1 = order.ShippingStreetAddress,
                Address2 = order.ShippingStreetAddress2,
                City = order.ShippingCity,
                CountryName = order.ShippingCountry,

                FirstName = order.ShippingFirstName,
                LastName = order.ShippingLastName,
                Phone = order.ShippingPhone,
                PostalCode = order.ShippingPostal,
                StateName = order.ShippingStateOrTerritory,
            };

            return pastOrder;
        }
        private async Task<bool> SendOrderCompleteEmail(CurrentOrder currentOrder)
        {
            try
            {

                List<Stream> streamList = new List<Stream>();

                string htmlText = "<table style='border:1px solid #000; width:100%;'><tr><td><table style=' width:100%;'><tr><td><table style='text - align:left; width: 300px' align='left' width='300'>";
                htmlText += "<tr><td style='padding-left:10px; padding-top:15px;'><font face='arial' size='2' style='color:#000;'>Order No : " + currentOrder.Id + "</font></td></tr>";
                htmlText += "<tr><td style='padding-left:10px;'><font face='arial' size='2' style='color:#000;'>Date : " + DateTime.UtcNow + "</font></td></tr>";
                htmlText += "<tr><td style='padding-left:10px;'><font face='arial' size='2' style='color:#000;'>Total : " + String.Format("{0:0.00}", currentOrder.Total) + "</font></td></tr>";
                htmlText += "<tr><td style='padding-left:10px;'><font face='arial' size='2' style='color:#000;'>Payment Method : Credit Card </font> </td></tr>";


                htmlText += "<tr><td style='padding-left:10px;'><font face='arial' size='2' style='color:#000;'>Shipping  : " + currentOrder.ShippingMethodName + "</font> </td></tr></table>" +
                    " <table cellpadding='10' padding:10px;' align='left'><tr><td style='text-align: left;  width:250px;' align='left' width='250'><h3 style='margin:0;'>" +
                    "Shipping To :</h3> " + currentOrder.BillingInfo.FirstName + " " + currentOrder.BillingInfo.LastName + "</strong><br/>" + currentOrder.BillingInfo.Address1 + "<br/>" +
                    currentOrder.BillingInfo.City + ", " + currentOrder.BillingInfo.StateName + " " + currentOrder.BillingInfo.PostalCode +
                    "</p></td> <td style='text-align: left; width:250px;' align='left' width='250'><h3 style='margin:0;'>Billed To : </h3> " +
                    "" + currentOrder.BillingInfo.FirstName + " " + currentOrder.BillingInfo.LastName + "<br/>" +
                    currentOrder.ShippingInfo.Address1 + "<br/>" + currentOrder.BillingInfo.City + ", " + currentOrder.BillingInfo.StateName + " " +
                    currentOrder.BillingInfo.PostalCode + "</p></td></td></tr></table>";


                htmlText += "<table style='width:100%'><tr><td><table style='background-color: #dcdcdc; text-align: center; font-weight: 600; width:100%;'cellpadding='10'>" +
                    "<tr><td> <h2 style=' margin: 0;'> Order Summary </h2></td> </tr></table><br><br>";
                htmlText += "<table cellpadding='10' style='width:100%; padding:10px;'><tr><th  style='border: 1px solid #dedede;'></th>" +
                    "<th style='border: 1px solid #dedede;'><h4 style=' margin: 0;'>Product Name</h4></th><th style='border: 1px solid #dedede;'><h4 style=' margin: 0;'>Item Number</h4></th>" +
                    "<th style='border: 1px solid #dedede;'><h4 style=' margin: 0;'>Product Code</h4></th><th style='border: 1px solid #dedede;'><h4 style=' margin: 0;'>Description</h4></th>" +
                    "<th style='border: 1px solid #dedede;'><h4 style=' margin: 0;'>Quantity</h4></th><th style='border: 1px solid #dedede;'><h4 style=' margin: 0;'>Total</h4></th></tr>";


                foreach (var item in currentOrder.OrderItems)
                {

                    //Load image from url
                    //WebProxy myProxy = new WebProxy();
                    //HttpWebRequest req = (HttpWebRequest)WebRequest.Create(productTinyImageUrl);

                    //HttpWebResponse response = (HttpWebResponse)req.GetResponse();

                    //Stream stream = response.GetResponseStream();

                    //streamList.Add(stream);
                    var tmpImage = string.IsNullOrEmpty(item.ItemImage) ? item.ProductImage : item.ItemImage;
                    htmlText += "<tr><td style='padding:10px; border: 1px solid #dedede; text-align: center;'><img src='" + tmpImage +
                        "' alt='Email Reset Header' border='0' style=' width: 50px;' width='50' /></td>";
                    //if (item.fitment != null)
                    //{
                    //    htmlText += "<td style='padding:10px; border: 1px solid #dedede;'>" + item.productName + "<br/>" + item.application + "<br/>Position: " + item.fitment.position + "<br/> Sub Model: " + item.fitment.position;
                    //    foreach (Features feature in item.Features.features)
                    //    {
                    //        htmlText += "<br/>" + feature.feature_name + "";
                    //    }
                    //    htmlText += "</td>";
                    //}
                    //else
                    //{

                    htmlText += "<td style='padding:10px; border: 1px solid #dedede;'>" + item.ProductName + "(" + item.ProductCode + ") <br/>";


                    //}
                    htmlText += "<td style='padding:10px; border: 1px solid #dedede;'><p style=' margin: 0;'>" + item.ItemNumber + "</p></td>";
                    htmlText += "<td style='padding:10px; border: 1px solid #dedede;'><p style=' margin: 0;'>" + item.ProductCode + "</p></td>";
                    htmlText += "<td style='padding:10px; border: 1px solid #dedede;'><p style=' margin: 0;'>" + item.ItemDescription + "</p></td>";
                    htmlText += "<td style='padding:10px; border: 1px solid #dedede; text-align: center;'><p style=' margin: 0;'>" + item.LineQty + "</p></td>";
                    htmlText += "<td style='padding:10px; border: 1px solid #dedede; text-align: center;'><p style=' margin: 0;'>$" + String.Format("{0:0.00}", item.LineTotal ?? 0) + "</p></td></tr>";
                }
                htmlText += "</td></tr></table>";

                htmlText += "<table cellpadding='10' style='width:100%;'><tr><td style='text-align: right;' align='right'> Sub Total : $" + String.Format("{0:0.00}", currentOrder.SubTotal) + "</td></tr>";
                htmlText += "<tr><td style='text-align: right;' align='right'> Shipping Charges : $" + String.Format("{0:0.00}", currentOrder.ShippingCost) + "</td></tr>";
                htmlText += "<tr><td style='text-align: right;' align='right'> Sales Tax : $" + String.Format("{0:0.00}", currentOrder.Tax) + "</td></tr>";
                htmlText += "<tr><td style='text-align: right;' align='right'> Discount : $" + String.Format("{0:0.00}", currentOrder.CouponDiscount) + "</td></tr>";

                htmlText += "<tr><td  align='right'><table style='background-color:#3c3939; width:200px; height:1px;' width='200'></table></td></tr>";
                htmlText += "<tr><td style='text-align: right;' align='right'><h2 style='padding-top: 5px; padding-bottom: 4px; padding-left: 20px; padding-right: 3px; margin:0;'>Total : $" +
                    String.Format("{0:0.00}", currentOrder.Total) + "</h2></td></tr> ";
                htmlText += "<tr><td align='right'><table style='background-color: #3c3939; width:200px; height:1px;' width='200'></table></td></tr></table>";



                await EmailUtil.SendEmail("devops@machfirst.com", EbizClient.LoginSession.CurrentLogin().LoginSuccess ? EbizClient.LoginSession.CurrentLogin().LoginUser : currentOrder.BillingInfo.Email,
                                "Order " + currentOrder.Id + " from Vehicle Speciality", htmlText, "Vehicle Speciality");

                //await EmailUtil.SendEmail("support@Demo.com", "dulajmanjula@gmail.com",
                //              "Order Confirmation - " + currentOrder.Id, htmlText, "Mining Record");

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private async Task<UserInfo> FillInfoByContact(UserInfo userInfo)
        {

            var res = await EbizClient.Contact.GetContactByEmailAsync(userInfo.Email);


            Contact contact = (Contact)res.ContentObject;

            userInfo.FirstName = contact.ContactFirstName;
            userInfo.LastName = contact.ContactLastName;
            userInfo.Address1 = contact.ContactAddress;
            userInfo.Address2 = contact.ContactAddress2;
            userInfo.City = contact.ContactCity;
            userInfo.CountryCode = contact.ContactCountry;


            var countryObjList = await EbizClient.Common.GetCountriesAsync();
            List<Country> countries = (List<Country>)countryObjList.ContentObject;
            Country selectedCountry = countries.Where(x => x.CountryCode == contact.ContactCountry).FirstOrDefault();

            userInfo.CountryName = selectedCountry != null ? selectedCountry.CountryName : string.Empty;

            var stateObjList = await EbizClient.Common.GetStatesByCountryCodeAsync(contact.ContactCountry);
            List<State> states = (List<State>)stateObjList.ContentObject;
            State selectedState = states.Where(x => x.StateAbbr == contact.ContactStateOrTerritory).FirstOrDefault();

            userInfo.StateName = selectedState.StateName;


            userInfo.StateAbbr = contact.ContactStateOrTerritory;
            userInfo.PostalCode = contact.ContactPostal;
            userInfo.Phone = contact.ContactPhone;

            return userInfo;
        }

        private UserInfo GetContactInfo(int contactId, out Contact contactOut)
        {

            var res = EbizClient.Contact.GetContactById(contactId);
            Contact contact = (Contact)res.ContentObject;
            contactOut = contact;

            UserInfo userInfo = new UserInfo();

            userInfo.FirstName = contact.ContactFirstName;
            userInfo.LastName = contact.ContactLastName;
            userInfo.Email = contact.ContactEmail;
            userInfo.Address1 = contact.ContactAddress;
            userInfo.Address2 = contact.ContactAddress2;

            userInfo.City = contact.ContactCity;
            userInfo.CountryCode = contact.ContactCountry;
            userInfo.StateAbbr = contact.ContactStateOrTerritory;
            userInfo.PostalCode = contact.ContactPostal;
            userInfo.Phone = contact.ContactPhone;

            return userInfo;
        }

        private async Task sendVerificationEmail(string email, string code)
        {
            StringBuilder stringBuilder = new StringBuilder();
            string tagElement = @"<div>
                                    <p>Use below code for verify your contact information.</p>
                                    <h3>" + code + @"</h3>
                                  </div>";
            stringBuilder.Append(tagElement);
            await EmailUtil.SendEmail("devops@machfirst.com", email, "Vehicle Demo Customer Verification code", stringBuilder.ToString(), "Vehicle Demo Support");
        }

        private void sendVerificationSMS(string phoneNumber, string code)
        {
            string sms = "Vehicle Demo Verification Code: " + code;
            var res = SMSUtil.SendSms("+17207992868", phoneNumber, sms);
        }



        [HttpGet("Order/CustomerInfo")]
        [HttpGet("Order/CustomerInfo/{fromLogin}")]
        //[AnalyticFilter]
        public async Task<IActionResult> CustomerInfo(bool fromLogin)
        {
            bool allowNextLevel = false;
            var res = EbizClient.Order.GetCurrentOrder();
            if (fromLogin)
            {
                res.ContactId = 0;
                res.BillingInfo = new UserInfo();
                res.ShippingInfo = new UserInfo();
            }

            if (res.ContactId > 0) allowNextLevel = true;

            var countrywaiter = EbizClient.Common.GetCountriesAsync();
            bool ContactNotify = true;

            var profileRes = EbizClient.Profile.GetProfile().ContentObject;
            Profile profile = ((Profile)profileRes);
            res.CompanyLogo = profile.CompanyLogo;
            res.CompanyName = profile.CompanyName;

            if (res.ContactId == 0 && (EbizClient.LoginSession.CurrentLogin().LoginSuccess || EbizClient.Contact.GetAnalyticContact() > 0))
            {
                int contactId = 0;
                allowNextLevel = false;

                var userInfo = new UserInfo();
                if (EbizClient.LoginSession.CurrentLogin().LoginSuccess)
                {
                    contactId = EbizClient.LoginSession.CurrentLogin().ContactId ?? 0;
                    userInfo = SetUserInfo();
                    ContactNotify = EbizClient.LoginSession.CurrentLogin().ContactOptIn ?? false;
                }
                else
                {
                    contactId = EbizClient.Contact.GetAnalyticContact();
                    var contact = new Contact();
                    userInfo = GetContactInfo(contactId, out contact);
                    ContactNotify = contact.ContactOptIn ?? false;
                }
                res.ContactId = contactId;
                res.ContactNotify = ContactNotify;
                res.ShippingInfo = userInfo;
                //EbizClient.Order.SetOrderSession(res);

                // modify order async with current contact
                await EbizClient.Order.ModifyCartAsync(new Order() { CartId = res.Id, ContactId = contactId });
            }

            //write analytics
            if (!res.IsInInfoPage)
            {
                //write analytics
                EbizClient.Order.LogOrderAnalyticsAsync(new MarketingAnalyticDetail(), res.Id.ToString()).GetAwaiter().GetResult();

                //Write process trial and update process current step
                EbizClient.ProcessTrail.AddProcessTrailAsync(new ProcessTrail() { workflowPhaseId = 1156, notes = "Customer Information" }, res.Id).GetAwaiter().GetResult();
                res.IsInInfoPage = true;
            }

            res.CurrentOrderStep = 2;

            EbizClient.Order.SetOrderSession(res);
            ViewBag.FromPastOrder = false;
            ViewBag.Countries = (await countrywaiter).ContentObject;
            ViewBag.ShortCart = true;
            ViewBag.AllowNextLevel = allowNextLevel;

            ViewBag.OnlyTotal = true;
            ViewBag.NoLayoutView = true;
            return View(res);

        }

        public bool ForceLogin(int contactId)
        {
            var res = EbizClient.Account.GetForceLoginInfo(contactId);

            if (res.IsSuccessful)
            {
                var login = res.ContentObject as User;
                login.LoginSuccess = true;
                EbizClient.LoginSession.SetLoginSession(login);
            }

            return res.IsSuccessful;
        }

        [HttpPost("Order/CouponSubmit")]
        public async Task<IActionResult> CouponSubmit(string couponCode)
        {
            CurrentOrder currentOrder = EbizClient.Order.GetCurrentOrder();

            var coupon = await EbizClient.Order.GetCouponByCodeAsync(couponCode);
            if (coupon.IsSuccessful)
            {
                var res = await EbizClient.Order.PostOrderByCoupon(((OrderCoupon)(coupon.ContentObject)).couponId, currentOrder.Id);

                var updatedCartRes = await EbizClient.Order.GetCartAsync(currentOrder.Id);
                if (updatedCartRes.IsSuccessful)
                {
                    try
                    {
                        var updatedOrder = (Order)(updatedCartRes.ContentObject);

                        currentOrder.Total = updatedOrder.Total ?? 0;
                        currentOrder.CouponDiscount = updatedOrder.Discount ?? 0;
                        currentOrder.CouponCode = updatedOrder.couponCode;

                        EbizClient.Order.SetOrderSession(currentOrder);
                    }
                    catch (Exception)
                    {

                    }
                }

                return Json(new { isSuccessful = res.IsSuccessful, responseMessage = GetExactError(res.Content) });
            }
            else return Json(new { isSuccessful = false, responseMessage = "Invalid Coupon" });
        }

        private string GetExactError(string fullError)
        {
            string[] arr1 = fullError.Split('(');
            if (arr1.Length >= 2)
            {
                string[] arr2 = arr1[1].Split(')');
                if (arr2.Length > 1)
                {
                    return arr2[0];
                }
            }
            return string.Empty;
        }

        [HttpPost("Order/ClearOrderSession")]
        public JsonResult ClearOrderSession()
        {
            EbizClient.Order.SetOrderSession(new CurrentOrder());
            EbizClient.Order.SetCompleteOrderSession(new CurrentOrder());
            return Json(true);
        }
    }
}