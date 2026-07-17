using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
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

            var ebizClientId =
                Environment.GetEnvironmentVariable("EBIZ_CLIENT_ID")
                ?? Environment.GetEnvironmentVariable("PIMento_CLIENT_ID")
                ?? AppConfig.GetRequired("Ebiz:ClientId", "EBIZ_CLIENT_ID");

            var ebizClientSecret =
                Environment.GetEnvironmentVariable("EBIZ_CLIENT_SECRET")
                ?? Environment.GetEnvironmentVariable("PIMento_CLIENT_SECRET")
                ?? AppConfig.GetRequired("Ebiz:ClientSecret", "EBIZ_CLIENT_SECRET");
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
                    name: "parts",
                    pattern: "Parts",
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
    }
}
