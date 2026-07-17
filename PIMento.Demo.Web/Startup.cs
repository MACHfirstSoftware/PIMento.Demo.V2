using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using PHXCOM.PlatformSDK.Services;
using PIMento.Demo.Web.Utils;

namespace PIMento.Demo.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            AppConfig.Initialize(Configuration);

            services.AddApplicationInsightsTelemetry();
            services.AddAntiforgery(options =>
            {
                options.HeaderName = "X-CSRF-TOKEN";
            });

            services.AddControllersWithViews(options =>
                {
                    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
                })
                .AddRazorRuntimeCompilation();

            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(90);
            });
            services.AddHttpContextAccessor();

            var ebizClientId = FirstNonEmpty(
                Environment.GetEnvironmentVariable("EBIZ_CLIENT_ID"),
                Environment.GetEnvironmentVariable("PIMento_CLIENT_ID"),
                Configuration["Ebiz:ClientId"]);

            var ebizClientSecret = FirstNonEmpty(
                Environment.GetEnvironmentVariable("EBIZ_CLIENT_SECRET"),
                Environment.GetEnvironmentVariable("PIMento_CLIENT_SECRET"),
                Configuration["Ebiz:ClientSecret"]);

            if (string.IsNullOrWhiteSpace(ebizClientId) || string.IsNullOrWhiteSpace(ebizClientSecret))
            {
                throw new InvalidOperationException("Missing SDK client credentials. Expected EBIZ_* or PIMento_* environment variables.");
            }

            EbizClient.Connect(ebizClientId, ebizClientSecret);

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                //  app.UseStatusCodePages();

                //app.UseStatusCodePagesWithReExecute("/sy");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            var slugHostOverride = Environment.GetEnvironmentVariable("SLUG_HOST_OVERRIDE")
                ?? Configuration["SlugHostOverride"];

            if (!string.IsNullOrWhiteSpace(slugHostOverride))
            {
                app.Use(async (context, next) =>
                {
                    context.Request.Host = new HostString(slugHostOverride);
                    context.Request.Headers["Host"] = slugHostOverride;
                    await next().ConfigureAwait(false);
                });
            }

              

            app.UseRouting();
            app.UseAuthentication();
            app.UseSession();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "root",
                    pattern: "",
                    defaults: new { controller = "Home", action = "Index" });

                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action}/{id?}");

                // Keep legacy slug-based URLs routed through the existing handler.
                endpoints.MapControllerRoute(
                    name: "legacy-catchall",
                    pattern: "{*url}",
                    defaults: new { controller = "Home", action = "Handler" });

            });
        }

        private static string FirstNonEmpty(params string[] values)
        {
            foreach (var value in values)
            {
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return value;
                }
            }

            return string.Empty;
        }
    }
}
