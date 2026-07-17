using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PHXCOM.VehiclesDemo.Web.Utils
{
    public static class JsonUtil
    {
        public static T ListDeserialize<T>(string json)
        {
            if (string.IsNullOrEmpty(json)) return default(T);
            dynamic obj = JsonConvert.DeserializeObject<dynamic>(json);
            return Deserialize<T>(Serialize(obj.value));
        }

        public static T ListDeserializeObj<T>(string json)
        {
            if (string.IsNullOrEmpty(json)) return default(T);
            dynamic obj = JsonConvert.DeserializeObject<dynamic>(json);
            return Deserialize<T>(Serialize(obj));
        }

        public static T Deserialize<T>(string json)
        {
            T entity = JsonConvert.DeserializeObject<T>(json);
            return entity;
        }

        public static string Serialize(object obj)
        {
            return JsonConvert.SerializeObject(obj);
        }
    }
}
