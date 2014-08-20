using System;
using System.Collections.Generic;
using System.Collections;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DT.Models;
using DT.App_Code;
using System.Web.Security;

namespace DT.Controllers {
	public class HomeController : Controller {
		public static string SessionUsername;
		UsersDBContext db = new UsersDBContext();

		[Authorize]
		public ActionResult Index() {
			ViewBag.username = User.Identity.Name;
			return View();
		}
	}

}