using Microsoft.AspNet.Identity;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DT.Models;
using Microsoft.AspNet.Identity.Owin;

namespace DT {
	public partial class Startup {
		public void ConfigureAuth(IAppBuilder app) {
			app.CreatePerOwinContext(ApplicationDbContext.Create);
			app.CreatePerOwinContext<ApplicationUserManager>(ApplicationUserManager.Create);
			app.CreatePerOwinContext<ApplicationRoleManager>(ApplicationRoleManager.Create);
			app.CreatePerOwinContext<ApplicationSignInManager>(ApplicationSignInManager.Create);

			// 配置Middleware 組件
			app.UseCookieAuthentication(new CookieAuthenticationOptions {
				AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
				LoginPath = new PathString("/Account/Signin"),
				CookieSecure = CookieSecureOption.Never,
				ExpireTimeSpan = new TimeSpan(7, 0, 0, 0, 0)
			});
		}
	}
}