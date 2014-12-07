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

		UsersDBContext db = new UsersDBContext();

		[Authorize]
		public ActionResult Index() {
			if(Session["User"] != null) {
				User user = (User)Session["User"];
				ViewBag.UserName = user.username;
				ViewBag.UserId = user.ID;
			}
			else {
				User user = (
					from p in db.Users
					where p.username == User.Identity.Name
					select p
				).ToList()[0];
				ViewBag.UserName = user.username;
				ViewBag.UserId = user.ID;
			}
			return View();
		}
	}

}