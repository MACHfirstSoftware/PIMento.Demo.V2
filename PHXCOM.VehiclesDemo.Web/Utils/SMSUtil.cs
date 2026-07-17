using System;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace PHXCOM.VehiclesDemo.Web.Utils
{
    public class SMSUtil
    {
        internal static bool SendSms(string TwilioPhoneNumber, string ToNumber, string Message)
        {
            try
            {
                var accountSid = AppConfig.GetRequired("Twilio:AccountSid", "TWILIO_ACCOUNT_SID");
                var authToken = AppConfig.GetRequired("Twilio:AuthToken", "TWILIO_AUTH_TOKEN");
                string toNumber = ToNumber;

                TwilioClient.Init(accountSid, authToken);

                //ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls
                                                //| SecurityProtocolType.Tls11
                                                //| SecurityProtocolType.Tls12
                                                //| SecurityProtocolType.Ssl3;

                var message = MessageResource.Create(
                    body: Message,
                    from: new Twilio.Types.PhoneNumber(TwilioPhoneNumber),
                    to: new Twilio.Types.PhoneNumber(toNumber)
                );

                //Console.WriteLine(alphaSender.Sid);
                Console.WriteLine(message.Sid);

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
