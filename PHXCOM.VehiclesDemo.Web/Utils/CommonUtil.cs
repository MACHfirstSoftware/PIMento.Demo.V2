using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PHXCOM.VehiclesDemo.Web.Utils
{
    public static class CommonUtil
    {

        public static Dictionary<string, string> GetMonths()
        {
            return new Dictionary<string, string>() {
                         { "01", "01 (January)" }, { "02", "02 (February)" }, { "03", "03 (March)" },{ "04", "04 (April)" },{ "05", "05 (May)" },{ "06", "06 (June)" },
                         { "07", "07 (July)" },{ "08", "08 (August)" },{ "09", "09 (September)" },{ "10", "10 (October)" },{ "11", "11 (November)" } ,{ "12", "12 (December)" }

                };
        }

        public static int RandomNumber(int min, int max)
        {
            Random random = new Random();
            return random.Next(min, max);
        }
    }
}
