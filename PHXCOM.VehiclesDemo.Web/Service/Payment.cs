using PHXCOM.PlatformSDK.Models;
using System;
using System.Net.Http;
using System.Text;
using System.IO;
using System.Xml;

namespace PHXCOM.VehiclesDemo.Web.Service
{

    public class Payment
    {
        private static string ApiKey => Utils.AppConfig.GetRequired("Payments:ApiKey", "PAYMENTS_API_KEY");
        private static readonly HttpClient HttpClient = new HttpClient();
        //internal static IHttpContextAccessor _httpContextAccessor;
        //public Payment(IHttpContextAccessor _httpContextAccessor)
        //{
        //    this._httpContextAccessor = _httpContextAccessor;
        //}


        // send 
        internal static string ProcessStepOne(CurrentOrder currentOrder, string host)
        {


            try
            {

                host = host.Replace("pimento-demo.azurewebsites.net", "demo.pimento.io");

                XmlDocument xmlRequest = new XmlDocument();
                XmlDeclaration xmlDecl = xmlRequest.CreateXmlDeclaration("1.0", "UTF-8", "yes");
                XmlElement root = xmlRequest.DocumentElement;
                xmlRequest.InsertBefore(xmlDecl, root);


                XmlElement xmlSale = xmlRequest.CreateElement("sale");
                XmlElement xmlApiKey = xmlRequest.CreateElement("api-key");
                xmlApiKey.InnerText = ApiKey;
                xmlSale.AppendChild(xmlApiKey);

                XmlElement xmlRedirectUrl = xmlRequest.CreateElement("redirect-url");
                xmlRedirectUrl.InnerText = "https://" + host + "/Order/Verify";
                xmlSale.AppendChild(xmlRedirectUrl);

                XmlElement xmlAmount = xmlRequest.CreateElement("amount");
                xmlAmount.InnerText = currentOrder.Total.ToString();
                xmlSale.AppendChild(xmlAmount);

                //XmlElement xmlRemoteAddr = xmlRequest.CreateElement("ip-address");
                //xmlRemoteAddr.InnerText = Request.ServerVariables["REMOTE_ADDR"];
                //xmlSale.AppendChild(xmlRemoteAddr);

                XmlElement xmlCurrency = xmlRequest.CreateElement("currency");
                xmlCurrency.InnerText = "USD";
                xmlSale.AppendChild(xmlCurrency);

                XmlElement xmlOrderId = xmlRequest.CreateElement("order-id");
                xmlOrderId.InnerText = currentOrder.Id.ToString();
                xmlSale.AppendChild(xmlOrderId);

                //XmlElement xmlOrderDescription = xmlRequest.CreateElement("order-description");
                //xmlOrderDescription.InnerText = "Small Order";
                //xmlSale.AppendChild(xmlOrderDescription);

                //XmlElement xmlMDF1 = xmlRequest.CreateElement("merchant-defined-field-1");
                //xmlMDF1.InnerText = "Red";
                //xmlSale.AppendChild(xmlMDF1);

                //XmlElement xmlMDF2 = xmlRequest.CreateElement("merchant-defined-field-2");
                //xmlMDF2.InnerText = "Medium";
                //xmlSale.AppendChild(xmlMDF2);

                //XmlElement xmlTax = xmlRequest.CreateElement("tax-amount");
                //xmlTax.InnerText = "0.00";
                //xmlSale.AppendChild(xmlTax);

                //XmlElement xmlShipping = xmlRequest.CreateElement("shipping-amount");
                //xmlShipping.InnerText = "0.00";
                //xmlSale.AppendChild(xmlShipping);

                //if (!(CustomerVaultId.Text.Equals("") || CustomerVaultId.Text.Equals('0')))
                //{
                //    XmlElement xmlCustomerVaultId = xmlRequest.CreateElement("customer-vault-id");
                //    xmlCustomerVaultId.InnerText = CustomerVaultId.Text;
                //    xmlSale.AppendChild(xmlCustomerVaultId);

                //}
                // //To Add a customer
                ///* else
                // {
                //     XmlElement xmlAddCustomer = xmlRequest.CreateElement("add-customer");

                //     XmlElement xmlCustomerVaultId = xmlRequest.CreateElement("customer-vault-id");
                //     xmlCustomerVaultId.InnerText = "411";
                //     xmlAddCustomer.AppendChild(xmlCustomerVaultId);

                //     xmlSale.AppendChild(xmlAddCustomer);
                // }
                // */ 



                XmlElement xmlBillingAddress = xmlRequest.CreateElement("billing");

                XmlElement xmlFirstName = xmlRequest.CreateElement("first-name");
                xmlFirstName.InnerText = currentOrder.BillingInfo.FirstName;
                xmlBillingAddress.AppendChild(xmlFirstName);

                XmlElement xmlLastName = xmlRequest.CreateElement("last-name");
                xmlLastName.InnerText = currentOrder.BillingInfo.LastName;
                xmlBillingAddress.AppendChild(xmlLastName);

                XmlElement xmlAddress1 = xmlRequest.CreateElement("address1");
                xmlAddress1.InnerText = currentOrder.BillingInfo.Address1;
                xmlBillingAddress.AppendChild(xmlAddress1);

                XmlElement xmlCity = xmlRequest.CreateElement("city");
                xmlCity.InnerText = currentOrder.BillingInfo.City;
                xmlBillingAddress.AppendChild(xmlCity);

                XmlElement xmlState = xmlRequest.CreateElement("state");
                xmlState.InnerText = currentOrder.BillingInfo.StateName;
                xmlBillingAddress.AppendChild(xmlState);

                XmlElement xmlZip = xmlRequest.CreateElement("postal");
                xmlZip.InnerText = currentOrder.BillingInfo.PostalCode;
                xmlBillingAddress.AppendChild(xmlZip);

                XmlElement xmlCountry = xmlRequest.CreateElement("country");
                xmlCountry.InnerText = currentOrder.BillingInfo.CountryName;
                xmlBillingAddress.AppendChild(xmlCountry);

                XmlElement xmlPhone = xmlRequest.CreateElement("phone");
                xmlPhone.InnerText = currentOrder.BillingInfo.Phone;
                xmlBillingAddress.AppendChild(xmlPhone);

                //XmlElement xmlCompany = xmlRequest.CreateElement("company");
                //xmlCompany.InnerText = billingAddressCompany.Text;
                //xmlBillingAddress.AppendChild(xmlCompany);

                XmlElement xmlAddress2 = xmlRequest.CreateElement("address2");
                xmlAddress2.InnerText = currentOrder.BillingInfo.Address2;
                xmlBillingAddress.AppendChild(xmlAddress2);

                xmlSale.AppendChild(xmlBillingAddress);

                //////////

                XmlElement xmlShippingAddress = xmlRequest.CreateElement("shipping");

                XmlElement xmlSFirstName = xmlRequest.CreateElement("first-name");
                xmlSFirstName.InnerText = currentOrder.ShippingInfo.FirstName;
                xmlShippingAddress.AppendChild(xmlSFirstName);

                XmlElement xmlSLastName = xmlRequest.CreateElement("last-name");
                xmlSLastName.InnerText = currentOrder.ShippingInfo.LastName;
                xmlShippingAddress.AppendChild(xmlSLastName);

                XmlElement xmlSAddress1 = xmlRequest.CreateElement("address1");
                xmlSAddress1.InnerText = currentOrder.ShippingInfo.Address1;
                xmlShippingAddress.AppendChild(xmlSAddress1);

                XmlElement xmlSCity = xmlRequest.CreateElement("city");
                xmlSCity.InnerText = currentOrder.ShippingInfo.City;
                xmlShippingAddress.AppendChild(xmlSCity);

                XmlElement xmlSState = xmlRequest.CreateElement("state");
                xmlSState.InnerText = currentOrder.ShippingInfo.StateName;
                xmlShippingAddress.AppendChild(xmlSState);

                XmlElement xmlSZip = xmlRequest.CreateElement("postal");
                xmlSZip.InnerText = currentOrder.ShippingInfo.PostalCode;
                xmlShippingAddress.AppendChild(xmlSZip);

                XmlElement xmlSCountry = xmlRequest.CreateElement("country");
                xmlSCountry.InnerText = currentOrder.ShippingInfo.CountryName;
                xmlShippingAddress.AppendChild(xmlSCountry);

                XmlElement xmlSAddress2 = xmlRequest.CreateElement("address2");
                xmlSAddress2.InnerText = currentOrder.ShippingInfo.Address2;
                xmlShippingAddress.AppendChild(xmlSAddress2);

                //XmlElement xmlSFax = xmlRequest.CreateElement("fax");
                //xmlFax.InnerText = "";
                //xmlShippingAddress.AppendChild(xmlSFax);


                xmlSale.AppendChild(xmlShippingAddress);

                ////////////////

                //XmlElement xmlProduct = xmlRequest.CreateElement("product");

                //XmlElement xmlSku = xmlRequest.CreateElement("product-code");
                //xmlSku.InnerText = "SKU-123456";
                //xmlProduct.AppendChild(xmlSku);

                //XmlElement xmlDescription = xmlRequest.CreateElement("description");
                //xmlDescription.InnerText = "Books";
                //xmlProduct.AppendChild(xmlDescription);

                //XmlElement xmlQuantity = xmlRequest.CreateElement("quantity");
                //xmlQuantity.InnerText = "1";
                //xmlProduct.AppendChild(xmlQuantity);

                //XmlElement xmlUnit = xmlRequest.CreateElement("unit-of-measure");
                //xmlUnit.InnerText = "1";
                //xmlProduct.AppendChild(xmlUnit);


                //XmlElement xmlUnitAmount = xmlRequest.CreateElement("total-amount");
                //xmlUnitAmount.InnerText = "1";
                //xmlProduct.AppendChild(xmlUnitAmount);

                //XmlElement xmlUnitDiscount = xmlRequest.CreateElement("discount-amount");
                //xmlUnitDiscount.InnerText = "0.00";
                //xmlProduct.AppendChild(xmlUnitDiscount);


                //XmlElement xmlUnitTax = xmlRequest.CreateElement("tax-amount");
                //xmlUnitTax.InnerText = "0.00";
                //xmlProduct.AppendChild(xmlUnitTax);


                //XmlElement xmlTaxRate = xmlRequest.CreateElement("tax-rate");
                //xmlTaxRate.InnerText = "0.01";
                //xmlProduct.AppendChild(xmlTaxRate);



                //xmlSale.AppendChild(xmlProduct);
                /////////////////

                //XmlElement xmlProduct2 = xmlRequest.CreateElement("product");

                //XmlElement xmlSku2 = xmlRequest.CreateElement("product-code");
                //xmlSku2.InnerText = "SKU-654321";
                //xmlProduct2.AppendChild(xmlSku2);

                //XmlElement xmlDescription2 = xmlRequest.CreateElement("description");
                //xmlDescription2.InnerText = "Videos";
                //xmlProduct2.AppendChild(xmlDescription2);

                //XmlElement xmlQuantity2 = xmlRequest.CreateElement("quantity");
                //xmlQuantity2.InnerText = "1";
                //xmlProduct2.AppendChild(xmlQuantity2);

                //XmlElement xmlUnit2 = xmlRequest.CreateElement("unit-of-measure");
                //xmlUnit2.InnerText = "";
                //xmlProduct2.AppendChild(xmlUnit2);



                //XmlElement xmlUnitAmount2 = xmlRequest.CreateElement("total-amount");
                //xmlUnitAmount2.InnerText = "2";
                //xmlProduct2.AppendChild(xmlUnitAmount2);

                //XmlElement xmlUnitDiscount2 = xmlRequest.CreateElement("discount-amount");
                //xmlUnitDiscount2.InnerText = "0.00";
                //xmlProduct2.AppendChild(xmlUnitDiscount2);


                //XmlElement xmlUnitTax2 = xmlRequest.CreateElement("tax-amount");
                //xmlUnitTax2.InnerText = "0.00";
                //xmlProduct2.AppendChild(xmlUnitTax2);


                //XmlElement xmlTaxRate2 = xmlRequest.CreateElement("tax-rate");
                //xmlTaxRate2.InnerText = "0.01";
                //xmlProduct2.AppendChild(xmlTaxRate2);



                //xmlSale.AppendChild(xmlProduct2);


                xmlRequest.AppendChild(xmlSale);
                string responseFromServer = sendXMLRequest(xmlRequest);
                XmlReader responseReader = XmlReader.Create(new StringReader(responseFromServer));

                XmlDocument xDoc = new XmlDocument();
                xDoc.Load(responseReader);
                XmlNodeList response = xDoc.GetElementsByTagName("result");
                if (response[0].InnerText.Equals("1"))
                {
                    XmlNodeList formUrl = xDoc.GetElementsByTagName("form-url");
                    responseReader.Close();
                    return formUrl[0].InnerText;

                }
                return "";

            }
            catch (Exception)
            {
                return "";
            }

        }

        internal static Tuple<int, string> ProcessStepTwo(string token)
        {
            Tuple<int, string> res = new Tuple<int, string>(3, "");
            try
            {
                if (!string.IsNullOrEmpty(token))
                {
                    //MessageBox.Show(Request["token-id"]);
                    XmlDocument xmlRequest = new XmlDocument();
                    XmlDeclaration xmlDecl = xmlRequest.CreateXmlDeclaration("1.0", "UTF-8", "yes");
                    XmlElement root = xmlRequest.DocumentElement;
                    xmlRequest.InsertBefore(xmlDecl, root);


                    XmlElement xmlCompleteTransaction = xmlRequest.CreateElement("complete-action");
                    XmlElement xmlApiKey = xmlRequest.CreateElement("api-key");
                    xmlApiKey.InnerText = ApiKey;

                    xmlCompleteTransaction.AppendChild(xmlApiKey);
                    XmlElement xmlTokenId = xmlRequest.CreateElement("token-id");
                    xmlTokenId.InnerText = token;
                    xmlCompleteTransaction.AppendChild(xmlTokenId);


                    xmlRequest.AppendChild(xmlCompleteTransaction);
                    string responseFromServer = sendXMLRequest(xmlRequest);
                    XmlReader responseReader = XmlReader.Create(new StringReader(responseFromServer));


                    XmlDocument xDoc = new XmlDocument();
                    xDoc.Load(responseReader);
                    XmlNodeList response = xDoc.GetElementsByTagName("result");
                    XmlNodeList transaction = xDoc.GetElementsByTagName("transaction-id");

                    var result = response[0].InnerText;
                    responseReader.Close();
                    return new Tuple<int, string>(Convert.ToInt32(result), transaction[0].InnerText);

                }
                return res;

            }
            catch (Exception)
            {
                return res;
            }
        }

        private static string sendXMLRequest(XmlDocument xmlRequest)
        {
            const string uri = "https://secure.networkmerchants.com/api/v2/three-step";
            var requestBody = xmlRequest.OuterXml;
            using var request = new HttpRequestMessage(HttpMethod.Post, uri)
            {
                Content = new StringContent(requestBody, Encoding.UTF8, "text/xml")
            };

            using var response = HttpClient.Send(request);
            response.EnsureSuccessStatusCode();
            return response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

        }
    }
}
