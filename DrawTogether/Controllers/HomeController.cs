using System;
using System.Collections.Generic;
using System.Collections;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DT.Models;
using DT.App_Code;
using System.Web.Security;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

namespace DT.Controllers {
	public class HomeController : Controller {
		private ApplicationUserManager _userManager;
		public ApplicationUserManager UserManager {
			get {
				return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
			}
			private set {
				_userManager = value;
			}
		}
		[Authorize]
		public ActionResult Index() {
			ApplicationUser user;
			if(Session["User"] != null) {
				user = (ApplicationUser)Session["User"];
			}
			else {
				user = UserManager.FindByName(User.Identity.Name);
				if(user == null) {
					return RedirectToAction("SignOut", "Account");
				}
			}
			ViewBag.UserName = user.UserName;
			ViewBag.UserId = user.Id;
			return View();
		}
	}

}