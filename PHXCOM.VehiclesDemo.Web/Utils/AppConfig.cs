using System;
using Microsoft.Extensions.Configuration;

namespace PHXCOM.VehiclesDemo.Web.Utils
{
    public static class AppConfig
    {
        private static IConfiguration _configuration;

        public static void Initialize(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public static string GetRequired(string key, string environmentVariable)
        {
            var fromEnvironment = Environment.GetEnvironmentVariable(environmentVariable);
            if (!string.IsNullOrWhiteSpace(fromEnvironment))
            {
                return fromEnvironment;
            }

            var fromConfiguration = _configuration?[key];
            if (!string.IsNullOrWhiteSpace(fromConfiguration))
            {
                return fromConfiguration;
            }

            throw new InvalidOperationException($"Missing required configuration for '{key}' (env: {environmentVariable}).");
        }
    }
}