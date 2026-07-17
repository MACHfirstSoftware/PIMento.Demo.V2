using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PHXCOM.PlatformSDK.Services;

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
            services.AddApplicationInsightsTelemetry();
            services.AddControllersWithViews().AddRazorRuntimeCompilation();

            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(90);
            });
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            //EbizClient.Connect("3b7db6c5621d483bb0124e48339fcb85", "25a3e285c33c430598b269e11b3eda90");
            EbizClient.Connect("72BC6E4F069F4BA3BD0EA34D7B0C9E0B", "6c13591c7aa740fca940d54038e560eb");

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
                endpoints.MapControllerRoute("defaultsf", "{*url}", new { controller = "Pages", action = "Contact" });
                endpoints.MapControllerRoute("defaultsf", "{*url}", new { controller = "Product", action = "ProductSearchResults" });
                endpoints.MapControllerRoute("default", "{*url}", new { controller = "Home", action = "Handler" });

            });
        }
    }
}
