using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PIMento.Demo.Web.Utils;
using PHXCOM.PlatformSDK.Models;
using PHXCOM.PlatformSDK.Services;

namespace PIMento.Demo.Web.Controllers
{
    
    public class PagesController : Controller
    {
        [HttpGet("Pages/Contact")]
        public IActionResult Contact()
        {
            return View();
        }

        [HttpPost("Pages/ContactInquiry")]
        public async Task<JsonResult> ContactInquiry(Inquiry contactInquiryItems) 
        {
            bool isContactInquirySuccess = false;
            bool sendLeadEmail = false;
            bool sendClientEmail = false;
            if (contactInquiryItems != null) 
            {
                StringBuilder stringBuilder = new StringBuilder();
                
                stringBuilder.Append("<div> Hello " + contactInquiryItems.firstName + " " + contactInquiryItems.lastName + ",");
                stringBuilder.Append(" <br/><br/> We have received your inqury regarding <b>" + contactInquiryItems.salesOpportunityDescription + "</b>. We will respond your inquiry within 24 hours.");
                stringBuilder.Append("<br/><br/>Thank you,<br/><br/> The Vehicle Demo");
                stringBuilder.Append("</div>");

                StringBuilder stringBuilder1 = new StringBuilder();
                stringBuilder1.Append("<div> Hello, ");
                stringBuilder1.Append(" <br/><br/> New Lead has been created for the following customer. The lead details as follows. <br/> <br/> First Name: " + contactInquiryItems.firstName + "<br/> Last Name: " + contactInquiryItems.lastName + "<br/> Customer Email Address: " + contactInquiryItems.email + "<br/> Customer Phone #: " + contactInquiryItems.phone + "<br/> Request or Comments: " + contactInquiryItems.salesOpportunityDescription);
                stringBuilder1.Append("<br/><br/>Thank you,<br/><br/> The Vehicle Demo");
                stringBuilder1.Append("</div>");

                contactInquiryItems.salesOpportunityName = contactInquiryItems.firstName + " " + contactInquiryItems.lastName;
                contactInquiryItems.salesLeadSorceId = 11;
                contactInquiryItems.salesOpportunityTypeId = 1;
                contactInquiryItems.salesLeadTypeId = 61;

                //Insert Data to respective tables and send email to the client
                var res = await EbizClient.SalesContactInquiry.SaveContactInquiryAsync(contactInquiryItems);
                if (res.StatusCode.ToString().ToLower() == "created")
                {
                    var siteObj = await EbizClient.Site.GetSiteData(4);
                    if(siteObj != null && !string.IsNullOrEmpty(siteObj.LeadFromEmail)) sendLeadEmail = await EmailUtil.SendEmail("support@Demo.com", siteObj.LeadFromEmail, "New Lead Notification", stringBuilder1.ToString(), "Vehicle Demo Support");
                    sendClientEmail = await EmailUtil.SendEmail("support@Demo.com", contactInquiryItems.email, "General Inquiry", stringBuilder.ToString(), "Vehicle Demo Support");

                    if (sendLeadEmail || sendClientEmail) isContactInquirySuccess = true;
                }
            }
            return Json(new {isSuccess = isContactInquirySuccess });
        }
    }
}
