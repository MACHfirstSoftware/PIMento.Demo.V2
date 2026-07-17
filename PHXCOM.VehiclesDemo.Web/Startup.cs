using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PHXCOM.PlatformSDK.Services;
using PHXCOM.VehiclesDemo.Web.Utils;

namespace PHXCOM.VehiclesDemo.Web
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
            services.AddControllersWithViews().AddRazorRuntimeCompilation();

            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(90);
            });
            services.AddHttpContextAccessor();

            var ebizClientId = AppConfig.GetRequired("Ebiz:ClientId", "EBIZ_CLIENT_ID");
            var ebizClientSecret = AppConfig.GetRequired("Ebiz:ClientSecret", "EBIZ_CLIENT_SECRET");
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
            app.UseSession();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");

                // Keep legacy slug-based URLs routed through the existing handler.
                endpoints.MapControllerRoute(
                    name: "legacy-catchall",
                    pattern: "{*url}",
                    defaults: new { controller = "Home", action = "Handler" });

            });
        }
    }
}
