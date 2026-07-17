using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace PIMento.Demo.Web.Utils
{
    public static class JsonUtil
    {
        public static T ListDeserialize<T>(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return default;

            var parsed = JObject.Parse(json);
            var valueToken = parsed["value"];
            return valueToken == null ? default : valueToken.ToObject<T>();
        }

        public static T ListDeserializeObj<T>(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return default;
            return JsonConvert.DeserializeObject<T>(json);
        }

        public static T Deserialize<T>(string json)
        {
            return JsonConvert.DeserializeObject<T>(json);
        }

        public static string Serialize(object obj)
        {
            return JsonConvert.SerializeObject(obj);
        }
    }
}
