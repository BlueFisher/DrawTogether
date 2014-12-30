using DT.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace DT.Controllers {
	public class AccountController : Controller {
		private ApplicationUserManager _userManager;
		//private ApplicationRoleManager _roleManager;
		private ApplicationSignInManager _signInManager;
		public ApplicationUserManager UserManager {
			get {
				return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
			}
			private set {
				_userManager = value;
			}
		}
		//public ApplicationRoleManager RoleManager {
		//	get {
		//		return _roleManager ?? HttpContext.GetOwinContext().Get<ApplicationRoleManager>();
		//	}
		//	private set {
		//		_roleManager = value;
		//	}
		//}
		public ApplicationSignInManager SignInManager {
			get {
				return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
			}
			private set {
				_signInManager = value;
			}
		}

		public ActionResult Signin() {
			return View();
		}

		[HttpPost]
		public ActionResult SignIn(SignInModel model) {
			if(!ModelState.IsValid) {
				return Json(Util.GetErrorJsonFromModel(ModelState), JsonRequestBehavior.AllowGet);
			}
			if(model.ValidateCode.ToUpper() != (string)Session["ValidateCode"]) {
				return Json(new {
					status = 0,
					errorLocation = "validatecode",
					errorInfo = "验证码不正确！"
				}, JsonRequestBehavior.AllowGet);
			}
			var user = UserManager.FindByEmail(model.Email);
			if(user == null) {
				return Json(new {
					status = 0,
					errorLocation = "email",
					errorInfo = "没有此用户！"
				}, JsonRequestBehavior.AllowGet);
			}
			else if(UserManager.PasswordHasher.VerifyHashedPassword(user.PasswordHash, model.Password) == PasswordVerificationResult.Failed) {
				return Json(new {
					status = 0,
					errorLocation = "password",
					errorInfo = "密码错误！"
				}, JsonRequestBehavior.AllowGet);
			}
			SignInManager.SignIn(user, model.RememberMe, false);
			Session["User"] = user;
			return Json(new {
				status = 1,
				redirectUrl = "/Home/Index"
			}, JsonRequestBehavior.AllowGet);
		}
		public ActionResult GetValidateCode() {
			ValidateCode vCode = new ValidateCode();
			string code = vCode.CreateValidateCode();
			Session["ValidateCode"] = code;
			byte[] bytes = vCode.CreateValidateGraphic(code);
			return File(bytes, @"image/jpeg");
		}

		[HttpPost]
		public JsonResult SignUp(SignUpModel model) {
			if(!ModelState.IsValid) {
				return Json(Util.GetErrorJsonFromModel(ModelState), JsonRequestBehavior.AllowGet);
			}
			var user = new ApplicationUser {
				UserName = model.UserName,
				Email = model.Email,
			};

			if(UserManager.IsEmailDuplicated(model.Email)) {
				return Json(new {
					status = 0,
					errorLocation = "email",
					errorInfo = "该邮箱已经存在！"
				}, JsonRequestBehavior.AllowGet);
			}
			if(UserManager.IsUserNameDuplicated(model.UserName)) {
				return Json(new {
					status = 0,
					errorLocation = "username",
					errorInfo = "该用户名已经存在！"
				}, JsonRequestBehavior.AllowGet);
			}
			var result = UserManager.Create(user, model.Password);
			
			if(result.Succeeded) {
				SignInManager.SignIn(user, false, false);
				Session["User"] = user;
				return Json(new {
					status = 1,
					redirectUrl = "/Home/Index"
				}, JsonRequestBehavior.AllowGet);
			}
			return Json(new {
				status = 0,
				errorLocation = "email",
				errorInfo = "无法注册！"
			}, JsonRequestBehavior.AllowGet);
		}

		public ActionResult Signout() {
			SignInManager.AuthenticationManager.SignOut();
			return RedirectToAction("Signin");
		}
		
	}

	
}