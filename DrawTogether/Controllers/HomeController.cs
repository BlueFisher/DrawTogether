using System;
using System.Collections.Generic;
using System.Collections;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebIM.Models;

namespace WebIM.Controllers {
	public class HomeController : Controller {
		public static string SessionUsername;
		UsersDBContext db = new UsersDBContext();
		//
		// GET: /Home/
		public ActionResult Index() {
			if (Session["isSignin"] == null || !(bool)Session["isSignin"]) {
				return RedirectToAction("Signin");
			} else {
				SessionUsername = (string)Session["username"];
				ViewBag.username = SessionUsername;
				return View();
			}
		}
		public ActionResult Signin(string email, string password) {
			return View();
		}

		public JsonResult TrySignin(string email, string password) {
			#region 判断参数是否为空
			if (String.IsNullOrEmpty(email)) {
				return Json(new {
					status = 0,
					errorLocation = "email",
					errorInfo = "邮箱不能为空！"
				}, JsonRequestBehavior.AllowGet);
			}
			if (String.IsNullOrEmpty(password)) {
				return Json(new {
					status = 0,
					errorLocation = "password",
					errorInfo = "密码不能为空！"
				}, JsonRequestBehavior.AllowGet);
			}
			#endregion

			List<Users> list = (
				from p in db.Users
				where p.email == email
				select p
			).ToList();
			if (list.Count == 0) {
				return Json(new {
					status = 0,
					errorLocation = "email",
					errorInfo = "该邮箱不存在！"
				}, JsonRequestBehavior.AllowGet);
			}
			if (list[0].password != password) {
				return Json(new {
					status = 0,
					errorLocation = "password",
					errorInfo = "密码输入错误！"
				}, JsonRequestBehavior.AllowGet);
			}
			Session["isSignin"] = true;
			Session["username"] = list[0].username;
			return Json(new {
				status = 1,
			}, JsonRequestBehavior.AllowGet);
		}

		public JsonResult TrySignup(string username, string email, string password, string passwordAga) {
			#region 判断参数是否正确
			if (String.IsNullOrEmpty(username)) {
				return Json(new {
					status = 0,
					errorLocation = "username",
					errorInfo = "昵称不能为空！"
				}, JsonRequestBehavior.AllowGet);
			}
			if (String.IsNullOrEmpty(email)) {
				return Json(new {
					status = 0,
					errorLocation = "email",
					errorInfo = "邮箱不能为空！"
				}, JsonRequestBehavior.AllowGet);
			}
			if (String.IsNullOrEmpty(password)) {
				return Json(new {
					status = 0,
					errorLocation = "password",
					errorInfo = "密码不能为空！"
				}, JsonRequestBehavior.AllowGet);
			}
			if (passwordAga != password) {
				return Json(new {
					status = 0,
					errorLocation = "passwordAga",
					errorInfo = "两次密码不匹配！"
				}, JsonRequestBehavior.AllowGet);
			}
			#endregion

			#region 判断昵称、邮箱是否有重复
			List<Users> list = (
					from p in db.Users
					where p.username == username
					select p
				).ToList();
			if (list.Count > 0) {
				return Json(new {
					status = 0,
					errorLocation = "username",
					errorInfo = "该用户名已经存在！"
				});
			}

			list = (
				from p in db.Users
				where p.email == email
				select p
			).ToList();
			if (list.Count > 0) {
				return Json(new {
					status = 0,
					errorLocation = "email",
					errorInfo = "该邮箱已经存在！"
				});
			} 
			#endregion

			db.Users.Add(new Users() {
				username = username,
				email = email,
				password = password
			});
			db.SaveChanges();
			Session["isSignin"] = true;
			Session["username"] = username;
			return Json(new {
				status = 1
			});
		}
		public ActionResult Signout() {
			Session.Abandon();
			return RedirectToAction("Signin");
		}
	}
}