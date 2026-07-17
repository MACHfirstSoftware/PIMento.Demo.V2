using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace PIMento.Demo.Web.Utils
{
    public static class EmailUtil
    {

        public static async Task<bool> SendEmail(string from, string to, string subject, string htmlText, string fromDisplayName)
        {   
            try
            {
                //var myMessage = new SendGridMessage();
                //myMessage.From = new MailAddress(from, fromDisplayName);
                //myMessage.AddTo(to);
                //myMessage.Subject = subject;
                //myMessage.Html = htmlText;

                //string username = "ebizplatform";
                //var pswd = "ebiz2014";
                //var domain = "smtp.sendgrid.net";

                //var credentials = new NetworkCredential(username, pswd, domain);
                //var transportweb = new SendGrid.Web(credentials);
                //await transportweb.DeliverAsync(myMessage);
                MailMessage mailMsg = new MailMessage();
                mailMsg.From = new MailAddress(from, fromDisplayName);
                mailMsg.To.Add(to);
                mailMsg.Subject = subject;
                mailMsg.Body = htmlText;
                mailMsg.IsBodyHtml = true;

                // Init SmtpClient and send
                SmtpClient smtpClient = new SmtpClient("smtp.sendgrid.net");
                var sendGridApiKey = AppConfig.GetRequired("SendGrid:ApiKey", "SENDGRID_API_KEY");
                NetworkCredential credentials = new NetworkCredential("apikey", sendGridApiKey);
                smtpClient.Credentials = credentials;
                await smtpClient.SendMailAsync(mailMsg);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }




        //public static async Task<bool> SendEmail(string fromEmail, string toEmail, string subject, string htmlText, string fromDisplayName)
        //{
        //    try
        //    {

        //        var apiKey = Environment.GetEnvironmentVariable("SENDGRID_API_KEY");
        //        var client = new SendGridClient(apiKey,);
        //        var from = new EmailAddress(fromEmail, fromDisplayName);
        //        var to = new EmailAddress(toEmail, "user");
        //        // var plainTextContent = "";
        //        var htmlContent = htmlText;
        //        var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlContent);
        //        var response = await client.SendEmailAsync(msg);

        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        return false;
        //    }
        //}

    }
}
