using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace PHXCOM.VehiclesDemo.Web.Utils
{
    public class SMSUtil
    {
        [Obsolete]
        internal static bool SendSms(string TwilioPhoneNumber, string ToNumber, string Message)
        {
            try
            {
                var accountSid = Environment.GetEnvironmentVariable("TWILIO_ACCOUNT_SID");
                var authToken = Environment.GetEnvironmentVariable("TWILIO_AUTH_TOKEN");
                if (string.IsNullOrWhiteSpace(accountSid) || string.IsNullOrWhiteSpace(authToken))
                {
                    throw new InvalidOperationException("Missing Twilio credentials in environment variables.");
                }
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
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}
